"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  playerId: number;
  peerConnected: boolean;
  sendSignal: (msg: object) => void;
  incomingSignal: object | null;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

type PermState = "granted" | "denied" | "prompt" | "unknown";

export default function VideoCall({ playerId, peerConnected, sendSignal, incomingSignal }: Props) {
  const localVideoRef    = useRef<HTMLVideoElement>(null);
  const remoteVideoRef   = useRef<HTMLVideoElement>(null);
  const pcRef            = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef   = useRef<MediaStream | null>(null);
  const hostStarted      = useRef(false);
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const analyserRef      = useRef<AnalyserNode | null>(null);
  const animFrameRef     = useRef<number | null>(null);

  const [status,    setStatus]    = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [muted,     setMuted]     = useState(false);
  const [videoOff,  setVideoOff]  = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micPerm,   setMicPerm]   = useState<PermState>("unknown");
  const [camPerm,   setCamPerm]   = useState<PermState>("unknown");
  const [showPermHelp, setShowPermHelp] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // ── Permission check ───────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const mic = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setMicPerm(mic.state as PermState);
        mic.onchange = () => setMicPerm(mic.state as PermState);
        const cam = await navigator.permissions.query({ name: "camera" as PermissionName });
        setCamPerm(cam.state as PermState);
        cam.onchange = () => setCamPerm(cam.state as PermState);
        if (mic.state === "denied" || cam.state === "denied") setShowPermHelp(true);
      } catch { /* fallback */ }
    };
    check();
  }, []);

  // ── Audio analyser ─────────────────────────────────────────────────────────
  const startAnalyser = useCallback((stream: MediaStream) => {
    try {
      const ctx     = new AudioContext();
      audioCtxRef.current = ctx;
      const source  = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, (avg / 128) * 100 * 2.5));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } catch { /* AudioContext not available */ }
  }, []);

  // ── WebRTC ─────────────────────────────────────────────────────────────────
  const setupPC = useCallback(async (): Promise<RTCPeerConnection | null> => {
    if (pcRef.current) return pcRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setMicPerm("granted"); setCamPerm("granted"); setShowPermHelp(false);
      startAnalyser(stream);
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        setStatus("connected");
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) sendSignal({ type: "webrtc_ice", candidate: e.candidate.toJSON() });
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") setStatus("error");
      };
      return pc;
    } catch {
      setStatus("error"); setShowPermHelp(true); return null;
    }
  }, [sendSignal, startAnalyser]);

  useEffect(() => {
    if (!peerConnected || playerId !== 0 || hostStarted.current) return;
    hostStarted.current = true;
    (async () => {
      setStatus("connecting");
      const pc = await setupPC();
      if (!pc) return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: "webrtc_offer", sdp: offer });
    })();
  }, [peerConnected, playerId, setupPC, sendSignal]);

  useEffect(() => {
    if (!incomingSignal) return;
    const msg = incomingSignal as Record<string, unknown>;
    (async () => {
      if (msg.type === "webrtc_offer") {
        setStatus("connecting");
        const pc = await setupPC();
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp as RTCSessionDescriptionInit));
        for (const c of pendingCandidates.current) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        pendingCandidates.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: "webrtc_answer", sdp: answer });
      } else if (msg.type === "webrtc_answer") {
        const pc = pcRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp as RTCSessionDescriptionInit));
        for (const c of pendingCandidates.current) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        pendingCandidates.current = [];
      } else if (msg.type === "webrtc_ice") {
        const pc = pcRef.current;
        if (!pc?.remoteDescription) { pendingCandidates.current.push(msg.candidate as RTCIceCandidateInit); return; }
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate as RTCIceCandidateInit)).catch(() => {});
      }
    })();
  }, [incomingSignal, setupPC, sendSignal]);

  useEffect(() => () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
  }, []);

  const toggleMute  = () => { localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = muted));  setMuted(!muted); };
  const toggleVideo = () => { localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = videoOff)); setVideoOff(!videoOff); };

  const statusBadge = {
    idle:       !peerConnected ? "⏳ ממתין לחיבור" : "🔄 מאתחל",
    connecting: "🔄 מתחבר...",
    connected:  "🟢 מחובר",
    error:      "❌ שגיאה",
  }[status];

  const myName    = playerId === 0 ? "👴 סבא/סבתא" : "🧒 נכד/נכדה";
  const otherName = playerId === 0 ? "🧒 נכד/נכדה" : "👴 סבא/סבתא";

  // ── Permission help banner ─────────────────────────────────────────────────
  if (showPermHelp && (micPerm === "denied" || camPerm === "denied")) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b-2 border-red-200 px-4 py-3 flex items-center justify-between gap-4" dir="rtl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <div className="font-bold text-red-700 text-sm">יש לאפשר גישה למצלמה ומיקרופון</div>
            <div className="text-xs text-red-500">לחץ על סמל המנעול בשורת הכתובת ← אפשר מצלמה ומיקרופון ← רענן עמוד</div>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${micPerm === "denied" ? "bg-red-200 text-red-700" : "bg-green-100 text-green-700"}`}>
            {micPerm === "denied" ? "🎤 חסום" : "🎤 ✅"}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${camPerm === "denied" ? "bg-red-200 text-red-700" : "bg-green-100 text-green-700"}`}>
            {camPerm === "denied" ? "📷 חסום" : "📷 ✅"}
          </span>
          <button onClick={() => setShowPermHelp(false)} className="text-red-400 hover:text-red-600 text-lg font-bold">✕</button>
        </div>
      </div>
    );
  }

  // ── Minimized pill ─────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-sm font-bold rounded-full shadow-2xl border border-white/10 hover:bg-gray-800/90 transition"
        >
          <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
          <span>📹</span>
          {muted && <span>🔇</span>}
          {videoOff && <span>📵</span>}
          <span className="text-gray-400 text-xs">{statusBadge}</span>
          <span className="opacity-50">▼</span>
        </button>
      </div>
    );
  }

  // ── Full video bar ─────────────────────────────────────────────────────────
  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 160 }}>
      <div className="h-full bg-gray-950/95 backdrop-blur-md flex items-center justify-center gap-4 px-6 border-b border-white/5 shadow-2xl">

        {/* Remote video */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0" style={{ width: 220, height: 140 }}>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {status !== "connected" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90">
              <div className="text-center text-white text-xs px-4">
                <div className="text-3xl mb-1">{playerId === 0 ? "🧒" : "👴"}</div>
                <div className="opacity-70">{statusBadge}</div>
              </div>
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-full font-medium">
            {otherName}
          </div>
        </div>

        {/* Center controls */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {/* Audio level visualizer */}
          <div className="flex items-end gap-0.5 h-6">
            {[20, 40, 60, 80, 100].map((threshold, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-75 ${!muted && audioLevel > threshold ? "bg-green-400" : "bg-gray-700"}`}
                style={{ height: `${(i + 1) * 4 + 2}px` }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              title={muted ? "בטל השתקה" : "השתק"}
              className={`w-10 h-10 rounded-full text-lg font-bold transition active:scale-90 flex items-center justify-center ${muted ? "bg-red-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
            >
              {muted ? "🔇" : "🎤"}
            </button>
            <button
              onClick={toggleVideo}
              title={videoOff ? "הפעל מצלמה" : "כבה מצלמה"}
              className={`w-10 h-10 rounded-full text-lg font-bold transition active:scale-90 flex items-center justify-center ${videoOff ? "bg-red-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
            >
              {videoOff ? "📵" : "📷"}
            </button>
            <button
              onClick={() => setMinimized(true)}
              title="מזער"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-lg transition active:scale-90 flex items-center justify-center"
            >
              ▲
            </button>
          </div>

          {/* Status */}
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "connected" ? "text-green-400" : "text-yellow-400"}`}>
            {statusBadge}
          </div>
        </div>

        {/* Local video */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-700 flex-shrink-0" style={{ width: 220, height: 140 }}>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          {videoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-5xl">🚫</div>
          )}
          <div className="absolute bottom-1.5 left-2 text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-full font-medium">
            {myName} (אני)
          </div>
          {/* Local audio bar */}
          {!muted && (
            <div className="absolute bottom-7 left-2 right-2">
              <div className="h-1 bg-gray-600/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
