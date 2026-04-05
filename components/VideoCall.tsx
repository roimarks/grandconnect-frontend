"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  roomCode?: string;
  playerId: number;
  peerConnected: boolean;
  sendSignal: (msg: object) => void;
  incomingSignal: object | null;
}

// Free public TURN — openrelay project (no account needed)
const ICE: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    {
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:443",
        "turn:openrelay.metered.ca:80?transport=tcp",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turns:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

/** Wait up to `ms` for ICE gathering to complete, then resolve. */
function waitGathering(pc: RTCPeerConnection, ms = 5000): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") { resolve(); return; }
    const done = () => { if (pc.iceGatheringState === "complete") { pc.onicegatheringstatechange = null; resolve(); } };
    pc.onicegatheringstatechange = done;
    setTimeout(resolve, ms);          // safety timeout
  });
}

type Status = "idle" | "connecting" | "connected" | "error";

export default function VideoCall({ playerId, peerConnected, sendSignal, incomingSignal }: Props) {
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef          = useRef<RTCPeerConnection | null>(null);
  const localStream    = useRef<MediaStream | null>(null);
  const calling        = useRef(false);         // prevent double-call
  const peerSeenRef    = useRef(false);         // prevent re-triggering

  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const rafRef       = useRef<number | null>(null);

  const [status,     setStatus]     = useState<Status>("idle");
  const [muted,      setMuted]      = useState(false);
  const [videoOff,   setVideoOff]   = useState(false);
  const [audioLvl,   setAudioLvl]   = useState(0);
  const [permDenied, setPermDenied] = useState(false);
  const [minimized,  setMinimized]  = useState(false);
  const [gatherMsg,  setGatherMsg]  = useState("");

  // ── Audio visualiser ───────────────────────────────────────────────────────
  const startAnalyser = useCallback((stream: MediaStream) => {
    try {
      audioCtxRef.current?.close();
      const ctx      = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
        setAudioLvl(Math.min(100, (avg / 128) * 200));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch { /* ignore */ }
  }, []);

  // ── Get camera + mic ────────────────────────────────────────────────────────
  const getStream = useCallback(async (): Promise<MediaStream | null> => {
    if (localStream.current) return localStream.current;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = s;
      if (localVideoRef.current) { localVideoRef.current.srcObject = s; localVideoRef.current.play().catch(() => {}); }
      startAnalyser(s);
      setPermDenied(false);
      return s;
    } catch {
      setPermDenied(true);
      return null;
    }
  }, [startAnalyser]);

  // Get local video on mount
  useEffect(() => { getStream(); }, [getStream]);

  // ── Build a fresh RTCPeerConnection ────────────────────────────────────────
  const buildPC = useCallback((stream: MediaStream): RTCPeerConnection => {
    pcRef.current?.close();
    const pc = new RTCPeerConnection(ICE);
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
      setStatus("connected");
    };
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === "connected")                      setStatus("connected");
      if (s === "failed" || s === "disconnected") setStatus("error");
    };
    return pc;
  }, []);

  // ── Host: create offer (vanilla ICE – wait for full gather) ───────────────
  const startCall = useCallback(async () => {
    if (calling.current) return;
    calling.current = true;
    setStatus("connecting");

    const stream = await getStream();
    if (!stream) { calling.current = false; return; }

    const pc = buildPC(stream);
    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);

      setGatherMsg("אוסף מסלולי חיבור...");
      await waitGathering(pc);          // wait until all candidates are in the SDP
      setGatherMsg("");

      sendSignal({
        type: "webrtc_offer",
        sdp: { type: pc.localDescription!.type, sdp: pc.localDescription!.sdp },
      });
    } catch (err) {
      console.error("Offer error:", err);
      setStatus("error");
    }
  }, [getStream, buildPC, sendSignal]);

  // Trigger call when peer joins (host only)
  useEffect(() => {
    if (!peerConnected || playerId !== 0 || peerSeenRef.current) return;
    peerSeenRef.current = true;
    startCall();
  }, [peerConnected, playerId, startCall]);

  // ── Handle incoming signals ────────────────────────────────────────────────
  useEffect(() => {
    if (!incomingSignal) return;
    const msg = incomingSignal as Record<string, unknown>;

    (async () => {
      // ── Guest receives offer → answer ──
      if (msg.type === "webrtc_offer") {
        setStatus("connecting");
        const stream = await getStream();
        if (!stream) return;

        const pc = buildPC(stream);
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp as RTCSessionDescriptionInit));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        setGatherMsg("אוסף מסלולי חיבור...");
        await waitGathering(pc);
        setGatherMsg("");

        sendSignal({
          type: "webrtc_answer",
          sdp: { type: pc.localDescription!.type, sdp: pc.localDescription!.sdp },
        });

      // ── Host receives answer ──
      } else if (msg.type === "webrtc_answer") {
        const pc = pcRef.current;
        if (!pc || pc.signalingState !== "have-local-offer") return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp as RTCSessionDescriptionInit));
      }
      // (no separate ICE messages needed with vanilla ICE)
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingSignal]);

  // ── Retry ──────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    calling.current   = false;
    peerSeenRef.current = false;
    pcRef.current?.close();
    pcRef.current = null;
    setStatus("connecting");
    if (playerId === 0) startCall();
  }, [playerId, startCall]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close();
    localStream.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
  }, []);

  // ── Controls ───────────────────────────────────────────────────────────────
  const toggleMute  = () => { localStream.current?.getAudioTracks().forEach(t => (t.enabled  = muted));  setMuted(m => !m); };
  const toggleVideo = () => { localStream.current?.getVideoTracks().forEach(t => (t.enabled  = videoOff)); setVideoOff(v => !v); };

  const myName    = playerId === 0 ? "👴 סבא/סבתא" : "🧒 נכד/נכדה";
  const otherName = playerId === 0 ? "🧒 נכד/נכדה" : "👴 סבא/סבתא";
  const statusLabel = {
    idle:       !peerConnected ? "⏳ ממתין לצד השני" : "🔄 מאתחל",
    connecting: gatherMsg || "🔄 מתחבר...",
    connected:  "🟢 מחובר",
    error:      "❌ שגיאה — לחץ נסה שוב",
  }[status];

  // ── Permission denied ──────────────────────────────────────────────────────
  if (permDenied) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b-2 border-red-300 px-4 py-3 flex items-center justify-between gap-4" dir="rtl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <div className="font-bold text-red-700 text-sm">יש לאפשר גישה למצלמה ומיקרופון</div>
            <div className="text-xs text-red-500">לחץ על המנעול בשורת הכתובת → אפשר מצלמה ומיקרופון → רענן</div>
          </div>
        </div>
        <button onClick={() => { setPermDenied(false); getStream(); }}
          className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-bold hover:bg-red-700">
          🔄 נסה שוב
        </button>
      </div>
    );
  }

  // ── Minimised ──────────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-sm font-bold rounded-full shadow-2xl border border-white/10 hover:bg-gray-800 transition">
          <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
          📹 {muted && "🔇"}{videoOff && "📵"}
          <span className="text-gray-400 text-xs">{statusLabel}</span>
          <span className="opacity-50">▼</span>
        </button>
      </div>
    );
  }

  // ── Full bar ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 160 }}>
      <div className="h-full bg-gray-950/95 backdrop-blur-md flex items-center justify-center gap-4 px-6 border-b border-white/5 shadow-2xl">

        {/* Remote video */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0" style={{ width: 220, height: 140 }}>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {status !== "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 text-white text-center px-3 gap-1">
              <div className="text-3xl">{playerId === 0 ? "🧒" : "👴"}</div>
              <div className="text-xs opacity-70">{statusLabel}</div>
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-full">{otherName}</div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {/* Mic level */}
          <div className="flex items-end gap-0.5 h-6">
            {[15, 30, 50, 70, 90].map((t, i) => (
              <div key={i}
                className={`w-1.5 rounded-full transition-all duration-75 ${!muted && audioLvl > t ? "bg-green-400" : "bg-gray-700"}`}
                style={{ height: `${(i + 1) * 4 + 2}px` }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={toggleMute}
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition active:scale-90 ${muted ? "bg-red-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
              {muted ? "🔇" : "🎤"}
            </button>
            <button onClick={toggleVideo}
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition active:scale-90 ${videoOff ? "bg-red-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
              {videoOff ? "📵" : "📷"}
            </button>
            <button onClick={() => setMinimized(true)}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm flex items-center justify-center transition active:scale-90">
              ▲
            </button>
          </div>

          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "connected" ? "text-green-400" : status === "error" ? "text-red-400" : "text-yellow-400"}`}>
            {statusLabel}
          </div>

          {status === "error" && (
            <button onClick={retry}
              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full transition active:scale-95">
              🔄 נסה שוב
            </button>
          )}
        </div>

        {/* Local video */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-700 flex-shrink-0" style={{ width: 220, height: 140 }}>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          {videoOff && <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-5xl">🚫</div>}
          <div className="absolute bottom-1.5 left-2 text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-full">{myName} (אני)</div>
          {!muted && (
            <div className="absolute bottom-7 left-2 right-2">
              <div className="h-1 bg-gray-600/50 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 transition-all duration-75" style={{ width: `${audioLvl}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
