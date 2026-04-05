"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  playerId: number;
  peerConnected: boolean;
  sendSignal: (msg: object) => void;
  incomingSignal: object | null;
}

// Free public TURN servers (openrelay project – no account needed)
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turns:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:80?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

type CallStatus = "idle" | "connecting" | "connected" | "error";

export default function VideoCall({ playerId, peerConnected, sendSignal, incomingSignal }: Props) {
  const localVideoRef   = useRef<HTMLVideoElement>(null);
  const remoteVideoRef  = useRef<HTMLVideoElement>(null);
  const pcRef           = useRef<RTCPeerConnection | null>(null);
  const localStreamRef  = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const makingOffer     = useRef(false);
  const offerSent       = useRef(false);

  // Audio visualiser
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [status,      setStatus]      = useState<CallStatus>("idle");
  const [muted,       setMuted]       = useState(false);
  const [videoOff,    setVideoOff]    = useState(false);
  const [audioLevel,  setAudioLevel]  = useState(0);
  const [permDenied,  setPermDenied]  = useState(false);
  const [minimized,   setMinimized]   = useState(false);
  const [iceState,    setIceState]    = useState("");

  // ── Audio analyser ─────────────────────────────────────────────────────────
  const startAnalyser = useCallback((stream: MediaStream) => {
    try {
      audioCtxRef.current?.close();
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, (avg / 128) * 200));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } catch { /* ignore */ }
  }, []);

  // ── Get local media ────────────────────────────────────────────────────────
  const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }
      startAnalyser(stream);
      setPermDenied(false);
      return stream;
    } catch {
      setPermDenied(true);
      return null;
    }
  }, [startAnalyser]);

  // Get local video as soon as component mounts
  useEffect(() => { getLocalStream(); }, [getLocalStream]);

  // ── Create & configure peer connection ─────────────────────────────────────
  const createPC = useCallback((): RTCPeerConnection => {
    // Clean up old PC
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.onicegatheringstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    pendingCandidates.current = [];

    // Add local tracks
    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach(t => pc.addTrack(t, stream));

    // Receive remote stream
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
      setStatus("connected");
    };

    // Send ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({ type: "webrtc_ice", candidate: e.candidate.toJSON() });
      }
    };

    pc.onicegatheringstatechange = () => setIceState(pc.iceGatheringState);

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === "connected")                setStatus("connected");
      if (s === "failed" || s === "disconnected") setStatus("error");
    };

    return pc;
  }, [sendSignal]);

  // ── Host starts offer when second player joins ─────────────────────────────
  const startCall = useCallback(async () => {
    if (makingOffer.current) return;
    makingOffer.current = true;
    setStatus("connecting");
    offerSent.current = false;

    const stream = await getLocalStream();
    if (!stream) { makingOffer.current = false; setStatus("error"); return; }

    const pc = createPC();
    // Add tracks (in case stream was obtained after createPC)
    stream.getTracks().forEach(t => {
      if (!pc.getSenders().find(s => s.track === t)) pc.addTrack(t, stream);
    });

    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      sendSignal({ type: "webrtc_offer", sdp: pc.localDescription });
      offerSent.current = true;
    } catch (err) {
      console.error("Offer failed:", err);
      setStatus("error");
    }
    makingOffer.current = false;
  }, [createPC, getLocalStream, sendSignal]);

  // Trigger call when peer joins (host only)
  const peerConnectedRef = useRef(false);
  useEffect(() => {
    if (!peerConnected || playerId !== 0 || peerConnectedRef.current) return;
    peerConnectedRef.current = true;
    startCall();
  }, [peerConnected, playerId, startCall]);

  // ── Handle incoming WebRTC signals ─────────────────────────────────────────
  useEffect(() => {
    if (!incomingSignal) return;
    const msg = incomingSignal as Record<string, unknown>;

    (async () => {
      if (msg.type === "webrtc_offer") {
        // Guest receives offer → answer
        setStatus("connecting");
        const stream = await getLocalStream();
        if (!stream) return;

        const pc = createPC();
        stream.getTracks().forEach(t => {
          if (!pc.getSenders().find(s => s.track === t)) pc.addTrack(t, stream);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp as RTCSessionDescriptionInit));

        // Flush buffered ICE candidates
        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        }
        pendingCandidates.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: "webrtc_answer", sdp: pc.localDescription });

      } else if (msg.type === "webrtc_answer") {
        const pc = pcRef.current;
        if (!pc || pc.signalingState === "stable") return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp as RTCSessionDescriptionInit));
        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        }
        pendingCandidates.current = [];

      } else if (msg.type === "webrtc_ice") {
        const pc = pcRef.current;
        const candidate = msg.candidate as RTCIceCandidateInit;
        if (!pc || !pc.remoteDescription) {
          pendingCandidates.current.push(candidate);
          return;
        }
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingSignal]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
  }, []);

  // ── Controls ───────────────────────────────────────────────────────────────
  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => (t.enabled = muted));
    setMuted(m => !m);
  };
  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => (t.enabled = videoOff));
    setVideoOff(v => !v);
  };
  const retry = useCallback(() => {
    peerConnectedRef.current = false;
    offerSent.current = false;
    makingOffer.current = false;
    if (playerId === 0) {
      startCall();
    } else {
      // Guest just resets, host will re-offer or guest waits
      setStatus("connecting");
    }
  }, [playerId, startCall]);

  // ── Labels ─────────────────────────────────────────────────────────────────
  const myName    = playerId === 0 ? "👴 סבא/סבתא" : "🧒 נכד/נכדה";
  const otherName = playerId === 0 ? "🧒 נכד/נכדה" : "👴 סבא/סבתא";

  const statusLabel = {
    idle:       !peerConnected ? "⏳ ממתין לצד השני" : "🔄 מאתחל",
    connecting: `🔄 מתחבר... ${iceState === "gathering" ? "(מחפש נתיב)" : ""}`,
    connected:  "🟢 מחובר",
    error:      "❌ שגיאת חיבור",
  }[status];

  // ── Permission denied banner ───────────────────────────────────────────────
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
        <button onClick={() => { setPermDenied(false); getLocalStream(); }}
          className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-bold hover:bg-red-700">
          🔄 נסה שוב
        </button>
      </div>
    );
  }

  // ── Minimised pill ─────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-sm font-bold rounded-full shadow-2xl border border-white/10 hover:bg-gray-800 transition">
          <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
          📹 {muted && "🔇"} {videoOff && "📵"}
          <span className="text-gray-400 text-xs">{statusLabel}</span>
          <span className="opacity-50">▼</span>
        </button>
      </div>
    );
  }

  // ── Full video bar ─────────────────────────────────────────────────────────
  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 160 }}>
      <div className="h-full bg-gray-950/95 backdrop-blur-md flex items-center justify-center gap-4 px-6 border-b border-white/5 shadow-2xl">

        {/* Remote */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0" style={{ width: 220, height: 140 }}>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {status !== "connected" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90">
              <div className="text-center text-white text-xs px-4">
                <div className="text-3xl mb-1">{playerId === 0 ? "🧒" : "👴"}</div>
                <div className="opacity-70">{statusLabel}</div>
              </div>
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-full">
            {otherName}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {/* Audio level */}
          <div className="flex items-end gap-0.5 h-6">
            {[15, 30, 50, 70, 90].map((threshold, i) => (
              <div key={i}
                className={`w-1.5 rounded-full transition-all duration-75 ${!muted && audioLevel > threshold ? "bg-green-400" : "bg-gray-700"}`}
                style={{ height: `${(i + 1) * 4 + 2}px` }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={toggleMute} title={muted ? "בטל השתקה" : "השתק"}
              className={`w-10 h-10 rounded-full text-lg font-bold transition active:scale-90 flex items-center justify-center ${muted ? "bg-red-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
              {muted ? "🔇" : "🎤"}
            </button>
            <button onClick={toggleVideo} title={videoOff ? "הפעל מצלמה" : "כבה מצלמה"}
              className={`w-10 h-10 rounded-full text-lg font-bold transition active:scale-90 flex items-center justify-center ${videoOff ? "bg-red-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
              {videoOff ? "📵" : "📷"}
            </button>
            <button onClick={() => setMinimized(true)} title="מזער"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm transition active:scale-90 flex items-center justify-center">
              ▲
            </button>
          </div>

          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "connected" ? "text-green-400" : status === "error" ? "text-red-400" : "text-yellow-400"}`}>
            {statusLabel}
          </div>

          {/* Retry / manual call start */}
          {(status === "error" || (status === "connecting" && peerConnected && playerId === 0)) && (
            <button onClick={retry}
              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full transition active:scale-95">
              🔄 נסה שוב
            </button>
          )}
        </div>

        {/* Local */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-700 flex-shrink-0" style={{ width: 220, height: 140 }}>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          {videoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-5xl">🚫</div>
          )}
          <div className="absolute bottom-1.5 left-2 text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-full">
            {myName} (אני)
          </div>
          {!muted && (
            <div className="absolute bottom-7 left-2 right-2">
              <div className="h-1 bg-gray-600/50 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all duration-75" style={{ width: `${audioLevel}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
