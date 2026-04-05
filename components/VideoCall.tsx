"use client";
import { useEffect, useRef, useState } from "react";

// ── Jitsi External API type ────────────────────────────────────────────────
type JitsiAPI = {
  dispose: () => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  addEventListeners: (listeners: Record<string, () => void>) => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: Record<string, unknown>) => JitsiAPI;
  }
}

interface Props {
  roomCode: string;
  playerId: number;
  peerConnected: boolean;
  // kept for backward-compat but unused
  sendSignal?: (msg: object) => void;
  incomingSignal?: object | null;
}

export default function VideoCall({ roomCode, playerId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef       = useRef<JitsiAPI | null>(null);
  const initDone     = useRef(false);

  const [scriptReady, setScriptReady] = useState(false);
  const [minimized,   setMinimized]   = useState(false);
  const [joined,      setJoined]      = useState(false);

  // ── Load Jitsi Meet External API script ────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.JitsiMeetExternalAPI) { setScriptReady(true); return; }

    const existing = document.getElementById("jitsi-api-script");
    if (existing) {
      existing.addEventListener("load", () => setScriptReady(true));
      return;
    }

    const script = document.createElement("script");
    script.id    = "jitsi-api-script";
    script.src   = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, []);

  // ── Init Jitsi meeting when script + container are ready ──────────────────
  useEffect(() => {
    if (!scriptReady || !roomCode || !containerRef.current || initDone.current) return;
    initDone.current = true;

    const displayName = playerId === 0 ? "סבא/סבתא" : "נכד/נכדה";

    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName: `GrandConnect${roomCode}`,
      width:    "100%",
      height:   "100%",
      parentNode: containerRef.current,
      userInfo: { displayName },

      configOverwrite: {
        prejoinPageEnabled:     false,   // skip "enter your name" screen
        startWithAudioMuted:    false,
        startWithVideoMuted:    false,
        disableDeepLinking:     true,
        enableWelcomePage:      false,
        disableInviteFunctions: true,
        hideConferenceSubject:  true,
        hideConferenceTimer:    true,
        // Minimal toolbar
        toolbarButtons: ["microphone", "camera", "hangup"],
        // Let Jitsi choose the best STUN/TURN automatically
      },

      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS:              ["microphone", "camera", "hangup"],
        SHOW_JITSI_WATERMARK:         false,
        SHOW_WATERMARK_FOR_GUESTS:    false,
        MOBILE_APP_PROMO:             false,
        HIDE_INVITE_MORE_HEADER:      true,
        SHOW_CHROME_EXTENSION_BANNER: false,
        DEFAULT_REMOTE_DISPLAY_NAME:  "אורח",
        TOOLBAR_ALWAYS_VISIBLE:       true,
      },
    });

    apiRef.current = api;

    api.addEventListeners({
      videoConferenceJoined: () => setJoined(true),
    });

    return () => {
      api.dispose();
      apiRef.current = null;
      initDone.current = false;
    };
  }, [scriptReady, roomCode, playerId]);

  // ── Minimised pill ─────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-5 py-2 bg-gray-900/95 text-white text-sm font-bold rounded-full shadow-2xl border border-white/10 hover:bg-gray-800 transition"
        >
          <span className={`w-2 h-2 rounded-full ${joined ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
          📹 {joined ? "מחובר" : "מתחבר..."}
          <span className="opacity-50 text-xs">▼ הצג</span>
        </button>
      </div>
    );
  }

  // ── Full video bar ─────────────────────────────────────────────────────────
  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 220 }}>
      <div className="relative w-full h-full bg-gray-950 border-b border-white/10 shadow-2xl">

        {/* Jitsi container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Loading overlay while script loads */}
        {!scriptReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 text-white text-sm gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>טוען וידאו...</span>
          </div>
        )}

        {/* Minimise button */}
        <button
          onClick={() => setMinimized(true)}
          title="מזער"
          className="absolute top-2 left-2 z-20 w-7 h-7 bg-gray-800/80 hover:bg-gray-700 text-white text-xs rounded-full flex items-center justify-center font-bold transition"
        >
          ▲
        </button>
      </div>
    </div>
  );
}
