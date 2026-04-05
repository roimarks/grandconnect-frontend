"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  onClose: () => void;
}

type MicStatus = "idle" | "recording" | "playing" | "done";

export default function AudioVideoTest({ onClose }: Props) {
  // ── Camera ────────────────────────────────────────────────────────────────
  const videoRef       = useRef<HTMLVideoElement>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const [camOk,  setCamOk]  = useState<boolean | null>(null);
  const [camErr, setCamErr] = useState("");

  // ── Microphone level ──────────────────────────────────────────────────────
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const rafRef         = useRef<number | null>(null);
  const [micLevel,  setMicLevel]  = useState(0);   // 0-100
  const [micOk,     setMicOk]     = useState<boolean | null>(null);
  const micPeakRef     = useRef(0);

  // ── Mic record & playback ─────────────────────────────────────────────────
  const recorderRef    = useRef<MediaRecorder | null>(null);
  const chunksRef      = useRef<Blob[]>([]);
  const playbackRef    = useRef<HTMLAudioElement | null>(null);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [recCountdown, setRecCountdown] = useState(3);

  // ── Speaker test ──────────────────────────────────────────────────────────
  const [speakerPlaying, setSpeakerPlaying] = useState(false);
  const [speakerOk,      setSpeakerOk]      = useState<boolean | null>(null);

  // ── Init: open camera + mic ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;

        // Camera preview
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setCamOk(true);
        }

        // Mic level analyser
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        const src = ctx.createMediaStreamSource(stream);
        src.connect(analyser);
        setMicOk(true);

        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(buf);
          const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
          const level = Math.min(100, Math.round((avg / 128) * 100 * 2.5));
          setMicLevel(level);
          if (level > micPeakRef.current) micPeakRef.current = level;
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

      } catch (e: unknown) {
        if (cancelled) return;
        setCamOk(false);
        setMicOk(false);
        const msg = (e instanceof Error) ? e.message : String(e);
        if (msg.includes("Permission") || msg.includes("NotAllowed")) {
          setCamErr("הגישה למצלמה/מיקרופון נחסמה. אנא אפשר גישה בדפדפן ונסה שוב.");
        } else {
          setCamErr("לא נמצאה מצלמה או מיקרופון במחשב.");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Record mic for 3 seconds then play back ───────────────────────────────
  const startMicTest = useCallback(() => {
    if (!streamRef.current || micStatus !== "idle") return;
    const audioStream = new MediaStream(streamRef.current.getAudioTracks());
    const recorder = new MediaRecorder(audioStream);
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      playbackRef.current = audio;
      setMicStatus("playing");
      audio.play();
      audio.onended = () => { setMicStatus("done"); URL.revokeObjectURL(url); };
    };

    recorder.start();
    setMicStatus("recording");
    setRecCountdown(3);

    let count = 3;
    const iv = setInterval(() => {
      count--;
      setRecCountdown(count);
      if (count <= 0) {
        clearInterval(iv);
        recorder.stop();
      }
    }, 1000);
  }, [micStatus]);

  // ── Speaker test: play a pleasant two-tone chime ──────────────────────────
  const playSpeakerTest = useCallback(() => {
    if (speakerPlaying) return;
    setSpeakerPlaying(true);

    const ctx = new AudioContext();
    const playTone = (freq: number, start: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.05);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Pleasant chime: C5 → E5 → G5
    playTone(523, 0,    0.5, 0.4);
    playTone(659, 0.25, 0.5, 0.4);
    playTone(784, 0.5,  0.7, 0.4);

    setTimeout(() => {
      setSpeakerPlaying(false);
      setSpeakerOk(true);
      ctx.close();
    }, 1500);
  }, [speakerPlaying]);

  // ── Mic level bar rendering ───────────────────────────────────────────────
  const barCount = 12;
  const barsLit  = Math.round((micLevel / 100) * barCount);
  const barColor = (i: number) => {
    if (i >= barCount - 2) return "bg-red-400";
    if (i >= barCount - 4) return "bg-yellow-400";
    return "bg-green-400";
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const Badge = ({ ok }: { ok: boolean | null }) => {
    if (ok === null) return <span className="text-gray-400 text-xl">⏳</span>;
    if (ok)         return <span className="text-green-500 text-2xl">✅</span>;
    return              <span className="text-red-500 text-2xl">❌</span>;
  };

  const micRecLabel = () => {
    if (micStatus === "idle")      return "🎙️ הקלט ונגן חזרה (3 שניות)";
    if (micStatus === "recording") return `⏺ מקליט... ${recCountdown}`;
    if (micStatus === "playing")   return "🔊 מנגן...";
    return "✅ שמעת את עצמך?";
  };

  return (
    <div
      className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">🎬 בדיקת מצלמה ושמע</h2>
            <p className="text-purple-100 text-sm mt-0.5">בדוק שהכל עובד לפני החיבור</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-3xl font-bold leading-none"
          >×</button>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Error banner ── */}
          {camErr && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 text-center font-bold">
              ⚠️ {camErr}
            </div>
          )}

          {/* ── Camera preview ── */}
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge ok={camOk} />
                <span className="font-bold text-gray-700 text-lg">מצלמה</span>
                {camOk && <span className="text-green-600 text-sm font-semibold">פועלת</span>}
                {camOk === false && <span className="text-red-600 text-sm font-semibold">לא זמינה</span>}
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video max-h-44 border-2 border-gray-200">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {!camOk && camOk !== null && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm text-center px-4">
                    לא נמצאה מצלמה
                  </div>
                )}
                {camOk === null && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {camOk && (
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    LIVE
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Microphone level ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge ok={micOk} />
              <span className="font-bold text-gray-700 text-lg">מיקרופון</span>
              {micOk && <span className="text-green-600 text-sm font-semibold">פועל — דבר כדי לבדוק</span>}
              {micOk === false && <span className="text-red-600 text-sm font-semibold">לא זמין</span>}
            </div>

            {/* Level bars */}
            <div className="flex items-end gap-1 h-10 bg-gray-100 rounded-xl px-3 py-2">
              {Array.from({ length: barCount }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-75 ${
                    i < barsLit ? barColor(i) : "bg-gray-300"
                  }`}
                  style={{ height: `${40 + i * 4}%` }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              {micLevel > 5 ? "✅ רמת שמע תקינה" : "דבר קרוב למיקרופון לבדיקה"}
            </p>

            {/* Record & playback */}
            <button
              onClick={startMicTest}
              disabled={!micOk || micStatus === "recording" || micStatus === "playing"}
              className={`mt-3 w-full py-3 rounded-xl font-bold text-white text-base transition-all ${
                micStatus === "recording"
                  ? "bg-red-500 animate-pulse"
                  : micStatus === "playing"
                  ? "bg-blue-500"
                  : micStatus === "done"
                  ? "bg-green-500"
                  : "bg-purple-600 hover:bg-purple-700 active:scale-95"
              } disabled:opacity-40`}
            >
              {micRecLabel()}
            </button>
            {micStatus === "done" && (
              <button
                onClick={() => setMicStatus("idle")}
                className="mt-2 w-full py-2 rounded-xl font-semibold text-purple-600 border-2 border-purple-300 hover:bg-purple-50 text-sm"
              >
                🔁 בדוק שוב
              </button>
            )}
          </div>

          {/* ── Speaker test ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge ok={speakerOk} />
              <span className="font-bold text-gray-700 text-lg">רמקולים</span>
              {speakerOk && <span className="text-green-600 text-sm font-semibold">שמעת את הצליל?</span>}
            </div>
            <button
              onClick={playSpeakerTest}
              disabled={speakerPlaying}
              className={`w-full py-3 rounded-xl font-bold text-white text-base transition-all ${
                speakerPlaying
                  ? "bg-blue-400 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              } disabled:opacity-60`}
            >
              {speakerPlaying ? "🔊 מנגן..." : "🔔 נגן צליל בדיקה"}
            </button>
            <p className="text-xs text-gray-400 mt-1 text-center">
              אם שמעת צלצול — הרמקולים עובדים
            </p>
          </div>

          {/* ── Summary & close ── */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-2 text-center">סיכום</h3>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl">{camOk ? "✅" : camOk === false ? "❌" : "⏳"}</div>
                <div className="text-xs text-gray-500 mt-1">מצלמה</div>
              </div>
              <div>
                <div className="text-2xl">{micOk ? "✅" : micOk === false ? "❌" : "⏳"}</div>
                <div className="text-xs text-gray-500 mt-1">מיקרופון</div>
              </div>
              <div>
                <div className="text-2xl">{speakerOk ? "✅" : "⏳"}</div>
                <div className="text-xs text-gray-500 mt-1">רמקולים</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-black text-xl rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            סיום הבדיקה ✓
          </button>
        </div>
      </div>
    </div>
  );
}
