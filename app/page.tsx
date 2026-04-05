"use client";
import { useState, useEffect } from "react";
import { useGameSocket } from "@/hooks/useGameSocket";
import MemoryGame from "@/components/MemoryGame";
import ConnectFour from "@/components/ConnectFour";
import SnakesAndLadders from "@/components/SnakesAndLadders";
import Checkers from "@/components/Checkers";
import VideoCall from "@/components/VideoCall";
import Chat from "@/components/Chat";
import AudioVideoTest from "@/components/AudioVideoTest";
import StoryLibrary from "@/components/StoryLibrary";
import StoryReader from "@/components/StoryReader";
import { getStoryById, type Story } from "@/lib/stories";
import {
  MemoryGameState,
  ConnectFourState,
  SnakesAndLaddersState,
  CheckersState,
} from "@/hooks/useGameSocket";

type Screen = "home" | "salon" | "game" | "story_library" | "story_reading";

const GAMES = [
  { id: "memory",             label: "🃏 זיכרון",          desc: "מצא את הזוגות" },
  { id: "connect_four",       label: "🔴 ארבע בשורה",      desc: "ארבע ברצף מנצח" },
  { id: "snakes_and_ladders", label: "🐍 סולמות ונחשים",   desc: "הגיע ל-100 ראשון" },
  { id: "checkers",           label: "♟️ דמקה",            desc: "משחק אסטרטגיה קלאסי" },
];

const PARTICLES = [
  { emoji: "❤️",  x: 8,  y: 15, dur: 5.5, delay: 0    },
  { emoji: "⭐",  x: 85, y: 20, dur: 7,   delay: 0.8  },
  { emoji: "💛",  x: 20, y: 70, dur: 6,   delay: 1.4  },
  { emoji: "✨",  x: 75, y: 60, dur: 8,   delay: 0.3  },
  { emoji: "💜",  x: 50, y: 85, dur: 5,   delay: 2    },
  { emoji: "🌟",  x: 92, y: 80, dur: 9,   delay: 1    },
  { emoji: "🧡",  x: 5,  y: 50, dur: 6.5, delay: 1.7  },
  { emoji: "💫",  x: 60, y: 10, dur: 7.5, delay: 0.5  },
  { emoji: "💕",  x: 40, y: 40, dur: 6,   delay: 3    },
  { emoji: "🌸",  x: 15, y: 90, dur: 8,   delay: 2.5  },
];

// Height of the fixed VideoCall bar
const VIDEO_BAR_H = 160;

export default function Home() {
  const {
    connected, roomCode, playerId, playerCount,
    gameState, gameType, error,
    incomingSignal, chatMessages, typingIndicator,
    storyState,
    createRoom, joinRoom, startGame,
    flipCard, dropPiece, rollDice,
    selectPiece, movePiece, drawLine,
    restartGame, sendSignal, sendChat, sendTyping,
    openStory, storyTurnPage, storyHighlight,
    returnToLobby, returnToLobbyTrigger,
    sendNavSync, navSyncTrigger,
  } = useGameSocket();

  const [screen,        setScreen]        = useState<Screen>("home");
  const [joinCode,      setJoinCode]      = useState("");
  const [joining,       setJoining]       = useState(false);
  const [activeStory,   setActiveStory]   = useState<Story | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [adminMode,     setAdminMode]     = useState(false);
  const [showAvTest,    setShowAvTest]    = useState(false);
  const [memoryConfig,  setMemoryConfig]  = useState(false);
  const [memPairs,      setMemPairs]      = useState(8);
  const [memTheme,      setMemTheme]      = useState("emojis");

  const effectivePlayerCount = adminMode ? 2 : playerCount;

  const inRoom = screen !== "home";

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCreate = () => { createRoom(); setScreen("salon"); };
  const handleJoin   = () => {
    if (joinCode.trim().length < 4) return;
    joinRoom(joinCode.trim().toUpperCase());
    setScreen("salon");
  };
  const goToSalon         = () => { returnToLobby(); sendNavSync("salon"); };
  const handleSelectStory = (story: Story) => {
    openStory(story.id);
    setActiveStory(story);
    setScreen("story_reading");
    sendNavSync("story_reading", undefined, story.id);
  };
  const handleCloseStory  = () => { setActiveStory(null); setScreen("salon"); sendNavSync("salon"); };

  // Exit: only from salon, with confirmation
  const handleExitApp = () => setShowExitConfirm(true);
  const confirmExit   = () => { window.location.reload(); };
  const cancelExit    = () => setShowExitConfirm(false);

  // Guest auto-advance when host starts a game
  if (gameState && screen === "salon") setScreen("game");

  // Sync story opening across both screens
  useEffect(() => {
    if (!storyState?.storyId) return;
    const story = getStoryById(storyState.storyId);
    if (story) {
      setActiveStory(story);
      if (["salon", "game", "story_library"].includes(screen)) setScreen("story_reading");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyState?.storyId]);

  // Sync return-to-lobby across both screens
  useEffect(() => {
    if (returnToLobbyTrigger > 0) setScreen("salon");
  }, [returnToLobbyTrigger]);

  // Sync nav from host to guest
  useEffect(() => {
    if (!navSyncTrigger || playerId === 0) return;
    const { screen: targetScreen, storyId: sid } = navSyncTrigger;
    if (targetScreen === "salon") {
      setScreen("salon");
    } else if (targetScreen === "game") {
      setScreen("game");
    } else if (targetScreen === "story_reading" && sid) {
      const story = getStoryById(sid);
      if (story) { setActiveStory(story); setScreen("story_reading"); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navSyncTrigger]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Global VideoCall — mounted ONCE, lives for the whole session ── */}
      {inRoom && playerId !== null && (
        <VideoCall
          playerId={playerId}
          peerConnected={effectivePlayerCount >= 2}
          sendSignal={sendSignal}
          incomingSignal={incomingSignal}
        />
      )}

      {/* ── Global Chat — same ── */}
      {inRoom && playerId !== null && (
        <Chat
          playerId={playerId}
          messages={chatMessages}
          onSend={sendChat}
          onTyping={sendTyping}
          typingIndicator={typingIndicator}
        />
      )}

      {/* ── Audio/Video test modal ── */}
      {showAvTest && <AudioVideoTest onClose={() => setShowAvTest(false)} />}

      {/* ── Exit confirmation modal ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center border-4 border-red-100">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">לצאת מהאפליקציה?</h2>
            <p className="text-gray-500 mb-2">הוידאו יתנתק והחדר יסגר.</p>
            <p className="text-gray-400 text-sm mb-6">לא ניתן לחזור לאותו חדר.</p>
            <div className="flex gap-3">
              <button
                onClick={cancelExit}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition text-lg active:scale-95"
              >
                ביטול
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition text-lg active:scale-95 shadow-lg"
              >
                יציאה 👋
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          HOME SCREEN
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "home" && (
        <main
          className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0a6b 30%, #1e1060 60%, #0f0826 100%)" }}
        >
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute pointer-events-none select-none animate-particle"
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                fontSize: "1.6rem",
                "--dur": `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                opacity: 0.6,
              } as React.CSSProperties}
            >
              {p.emoji}
            </div>
          ))}

          <div className="absolute pointer-events-none" style={{
            width: 420, height: 420, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)",
            top: "50%", left: "50%", transform: "translate(-50%, -65%)",
          }} />

          <div className="animate-hero-pulse mb-6 relative z-10">
            <div style={{ fontSize: "5.5rem", lineHeight: 1, filter: "drop-shadow(0 8px 24px rgba(168,85,247,0.5))" }}>
              👴❤️🧒
            </div>
          </div>

          <div className="text-center mb-8 relative z-10 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <h1
              className="text-6xl font-black tracking-tight animate-title-glow"
              style={{
                background: "linear-gradient(135deg, #ffffff 20%, #e9d5ff 50%, #c084fc 80%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                fontFamily: "Georgia, serif",
              }}
            >
              GrandConnect
            </h1>
            <p className="text-purple-300 text-lg mt-2 font-medium">משחקים וסיפורים לנכדים ולסבים 💛</p>
          </div>

          <div
            className={`mb-6 text-sm px-5 py-2 rounded-full font-semibold relative z-10 animate-fade-up
              ${connected ? "bg-green-900/60 text-green-300 border border-green-700/50" : "bg-red-900/60 text-red-300 border border-red-700/50"}`}
            style={{ animationDelay: "0.25s" }}
          >
            {connected ? "🟢 מחובר לשרת" : (
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-ping" />
                מתחבר לשרת... (מנסה מחדש אוטומטית)
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500/50 text-red-300 px-5 py-3 rounded-2xl text-center relative z-10">
              ⚠️ {error}
            </div>
          )}

          <div className="relative z-10 w-full max-w-xs animate-fade-up" style={{ animationDelay: "0.35s" }}>
            {!joining ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleCreate} disabled={!connected}
                  className="w-full py-5 text-white text-2xl font-black rounded-2xl shadow-2xl transition active:scale-95 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #9333ea, #6d28d9)", boxShadow: "0 0 30px rgba(147,51,234,0.5)" }}
                >
                  🏠 צור חדר חדש
                </button>
                <button
                  onClick={() => setJoining(true)} disabled={!connected}
                  className="w-full py-5 text-white text-2xl font-black rounded-2xl shadow-xl transition active:scale-95 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 0 25px rgba(37,99,235,0.4)" }}
                >
                  🚪 הצטרף לחדר
                </button>
                <button
                  onClick={() => setShowAvTest(true)}
                  className="w-full py-3 mt-1 rounded-2xl font-bold text-white text-base transition active:scale-95"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  🎬 בדיקת מצלמה ושמע
                </button>
                <button
                  onClick={() => { createRoom(); setAdminMode(true); setScreen("salon"); }}
                  disabled={!connected}
                  className="w-full py-2 text-purple-400 hover:text-purple-200 text-sm font-medium transition mt-1 underline"
                >
                  🔧 מצב פיתוח (יחיד)
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text" placeholder="קוד החדר (4 אותיות)"
                  value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-full py-4 px-5 text-3xl text-center tracking-widest rounded-2xl focus:outline-none uppercase font-black"
                  style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(168,85,247,0.5)", color: "#fff" }}
                />
                <button
                  onClick={handleJoin} disabled={joinCode.trim().length < 4}
                  className="w-full py-4 text-white text-xl font-black rounded-2xl shadow-xl transition active:scale-95 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                >
                  הצטרף ✅
                </button>
                <button onClick={() => setJoining(false)} className="text-purple-300 hover:text-white text-sm underline mt-1 transition">
                  ← חזרה
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SALON (waiting room / activity picker)
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "salon" && (
        <main
          className="min-h-screen flex flex-col p-6 overflow-y-auto"
          style={{
            background: "linear-gradient(160deg, #f5f0ff 0%, #ede9fe 50%, #faf5ff 100%)",
            paddingTop: VIDEO_BAR_H + 24,
            paddingLeft: 308,
          }}
        >
          {/* Exit button */}
          <button
            onClick={handleExitApp}
            className="fixed top-[168px] right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-red-500 hover:bg-red-50 font-bold rounded-xl shadow text-sm border border-red-100 transition"
            dir="rtl"
          >
            👋 יציאה
          </button>

          {adminMode && (
            <div className="fixed top-[168px] left-4 z-40 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              🔧 מצב פיתוח
            </div>
          )}

          {/* ── Room banner ── */}
          <div
            className="rounded-3xl px-8 py-6 mb-6 flex items-center justify-between text-white"
            style={{
              background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
            }}
          >
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "#c4b5fd" }}>קוד הסלון לשיתוף</p>
              <div
                className="text-5xl font-black tracking-widest"
                style={{
                  background: "linear-gradient(135deg, #fde68a, #ffffff)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}
              >
                {roomCode}
              </div>
              {playerId === 0 && (
                <p className="text-xs mt-1" style={{ color: "#c4b5fd" }}>📲 שלח את הקוד לנכד/ה</p>
              )}
            </div>
            <div className="flex gap-3">
              {[
                { emoji: "👴", label: playerId === 0 ? "אתה" : "מארח", active: true },
                { emoji: "🧒", label: playerId !== 0 ? "אתה" : "נכד/ה", active: effectivePlayerCount >= 2 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="text-center rounded-2xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.2)", minWidth: 100 }}
                >
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="text-xs font-bold mt-1" style={{ color: "#e9d5ff" }}>{p.label}</div>
                  <div className="text-xs font-semibold mt-0.5">
                    {p.active
                      ? <span style={{ color: "#4ade80" }}>✅ מחובר</span>
                      : <span style={{ color: "#fbbf24" }}>⏳ ממתין...</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Host UI ── */}
          {playerId === 0 && (
            <div className="w-full">
              <p className="text-purple-700 font-bold text-sm mb-3">🎮 בחר משחק:</p>

              {/* Game cards — 4 colorful tiles */}
              <div className="grid grid-cols-4 gap-4 mb-3">
                {/* Memory — togglable config */}
                <button
                  onClick={() => setMemoryConfig(v => !v)}
                  disabled={effectivePlayerCount < 2}
                  className={`rounded-2xl p-5 text-center transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${memoryConfig ? "scale-[1.03] ring-4 ring-white/70" : "hover:-translate-y-1"}`}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
                    boxShadow: "0 6px 24px rgba(124,58,237,0.45)",
                  }}
                >
                  <div className="text-4xl mb-2">🃏</div>
                  <div className="text-base font-black text-white">זיכרון</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>מצא את הזוגות</div>
                </button>

                {/* Connect Four */}
                <button
                  onClick={() => { startGame("connect_four"); setScreen("game"); sendNavSync("game", "connect_four"); }}
                  disabled={effectivePlayerCount < 2}
                  className="rounded-2xl p-5 text-center transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
                    boxShadow: "0 6px 24px rgba(37,99,235,0.4)",
                  }}
                >
                  <div className="text-4xl mb-2">🔴</div>
                  <div className="text-base font-black text-white">ארבע בשורה</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>ארבע ברצף מנצח</div>
                </button>

                {/* Snakes & Ladders */}
                <button
                  onClick={() => { startGame("snakes_and_ladders"); setScreen("game"); sendNavSync("game", "snakes_and_ladders"); }}
                  disabled={effectivePlayerCount < 2}
                  className="rounded-2xl p-5 text-center transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, #065f46, #047857)",
                    boxShadow: "0 6px 24px rgba(6,95,70,0.4)",
                  }}
                >
                  <div className="text-4xl mb-2">🐍</div>
                  <div className="text-base font-black text-white">סולמות ונחשים</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>הגיע ל-100 ראשון</div>
                </button>

                {/* Checkers */}
                <button
                  onClick={() => { startGame("checkers"); setScreen("game"); sendNavSync("game", "checkers"); }}
                  disabled={effectivePlayerCount < 2}
                  className="rounded-2xl p-5 text-center transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, #b45309, #92400e)",
                    boxShadow: "0 6px 24px rgba(180,83,9,0.4)",
                  }}
                >
                  <div className="text-4xl mb-2">♟️</div>
                  <div className="text-base font-black text-white">דמקה</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>משחק אסטרטגיה</div>
                </button>
              </div>

              {/* Memory config panel */}
              {memoryConfig && effectivePlayerCount >= 2 && (
                <div className="mb-4 bg-white rounded-2xl border-2 border-purple-200 p-4 shadow-lg" dir="rtl">
                  <p className="text-xs font-bold text-purple-600 mb-2">מספר קלפים:</p>
                  <div className="flex gap-2 mb-3">
                    {[
                      { pairs: 8,  label: "16 קלפים", desc: "קל" },
                      { pairs: 16, label: "32 קלפים", desc: "בינוני" },
                      { pairs: 24, label: "48 קלפים", desc: "מאתגר" },
                    ].map(opt => (
                      <button
                        key={opt.pairs}
                        onClick={() => setMemPairs(opt.pairs)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition ${memPairs === opt.pairs ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"}`}
                      >
                        {opt.label}<br/><span className="text-xs font-normal opacity-70">{opt.desc}</span>
                      </button>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-purple-600 mb-2">נושא:</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { id: "emojis",    label: "🎭 אמוג'י",   desc: "סמלים מהנים" },
                      { id: "animals",   label: "🐾 חיות",      desc: "בעלי חיים" },
                      { id: "artists",   label: "🎨 אמנים",     desc: "אמנים מפורסמים" },
                      { id: "inventors", label: "🔬 ממציאים",   desc: "ממציאים ומדענים" },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setMemTheme(t.id)}
                        className={`py-2 px-3 rounded-xl text-sm font-bold border-2 transition text-right ${memTheme === t.id ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"}`}
                      >
                        {t.label}<br/><span className="text-xs font-normal opacity-70">{t.desc}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      startGame("memory", { pairs: memPairs, theme: memTheme });
                      setScreen("game");
                      sendNavSync("game", "memory");
                      setMemoryConfig(false);
                    }}
                    className="w-full py-3 active:scale-95 text-white font-black text-lg rounded-xl shadow-lg transition"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                  >
                    🃏 התחל משחק זיכרון!
                  </button>
                </div>
              )}

              {effectivePlayerCount < 2 && (
                <p className="text-purple-400 text-xs text-center mb-4">ממתין לחיבור שני המשתמשים...</p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: "#d8b4fe" }} />
                <span className="text-purple-400 text-sm font-medium">או</span>
                <div className="flex-1 h-px" style={{ background: "#d8b4fe" }} />
              </div>

              {/* Story section */}
              <div
                className="rounded-2xl p-6 border-2 border-amber-200 flex items-center gap-5"
                style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}
                dir="rtl"
              >
                <div className="text-5xl">📚</div>
                <div className="flex-1">
                  <p className="text-amber-800 font-black text-lg mb-0.5">סיפורים משותפים</p>
                  <p className="text-amber-600 text-sm mb-3">בחר סיפור לקרוא יחד עם הנכד/ה — עם וידאו!</p>
                  <button
                    onClick={() => setScreen("story_library")}
                    disabled={effectivePlayerCount < 2}
                    className="px-8 py-3 active:scale-95 disabled:opacity-40 text-white text-base font-bold rounded-2xl shadow-lg transition"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}
                  >
                    📚 בחר סיפור
                  </button>
                  {effectivePlayerCount < 2 && (
                    <p className="text-amber-400 text-xs mt-2">ממתין לחיבור שני המשתמשים...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {playerId !== 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 mt-8">
              <div className="text-6xl">🚪</div>
              <h2 className="text-2xl font-bold text-purple-700">ברוך הבא לסלון!</h2>
              <p className="text-gray-500 text-lg animate-pulse">⏳ ממתין שהמארח יתחיל...</p>
            </div>
          )}
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STORY LIBRARY
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "story_library" && (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-100" style={{ paddingTop: VIDEO_BAR_H, paddingLeft: 288 }}>
          <StoryLibrary
            onSelectStory={handleSelectStory}
            onClose={() => setScreen("salon")}
          />
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STORY READING
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "story_reading" && activeStory && playerId !== null && (
        <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white" style={{ paddingLeft: 288 }}>
          <StoryReader
            story={activeStory}
            storyState={storyState}
            onTurnPage={storyTurnPage}
            onHighlight={storyHighlight}
            onClose={handleCloseStory}
          />
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          GAME SCREEN
      ══════════════════════════════════════════════════════════════════════ */}
      {screen === "game" && gameState && playerId !== null && (
        <main
          className="min-h-screen flex flex-col items-center p-6 pb-16"
          style={{
            background: "linear-gradient(160deg, #f5f0ff 0%, #ede9fe 50%, #faf5ff 100%)",
            paddingTop: VIDEO_BAR_H + 12,
            paddingLeft: 308,
          }}
        >
          {/* Header topbar */}
          <div
            className="flex items-center justify-between w-full max-w-3xl mb-5 px-5 py-3 rounded-2xl text-white"
            style={{
              background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
            }}
          >
            <button
              onClick={goToSalon}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition active:scale-95"
              style={{ background: "rgba(255,255,255,0.15)", color: "#e9d5ff" }}
            >
              ← הסלון
            </button>
            <div className="text-lg font-black tracking-tight" style={{ fontFamily: "Georgia, serif", color: "#e9d5ff" }}>
              GrandConnect
            </div>
            <div className="text-sm px-4 py-1.5 rounded-full font-bold" style={{ background: "rgba(255,255,255,0.15)", color: "#fde68a", letterSpacing: "0.12em" }}>
              {roomCode}
            </div>
          </div>

          {/* Game board */}
          {gameType === "memory" && (
            <MemoryGame gameState={gameState as MemoryGameState} playerId={playerId} onFlip={flipCard} />
          )}
          {gameType === "connect_four" && (
            <ConnectFour gameState={gameState as ConnectFourState} playerId={playerId} onDrop={dropPiece} />
          )}
          {gameType === "snakes_and_ladders" && (
            <SnakesAndLadders gameState={gameState as SnakesAndLaddersState} playerId={playerId} onRoll={rollDice} />
          )}
          {gameType === "checkers" && (
            <Checkers
              gameState={gameState as CheckersState}
              playerId={playerId}
              onSelectPiece={selectPiece}
              onMovePiece={movePiece}
            />
          )}

          {gameState.game_over && (
            <div className="mt-6">
              {playerId === 0 ? (
                <div className="flex gap-3">
                  <button
                    onClick={restartGame}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-2xl shadow-lg transition active:scale-95"
                  >
                    🔄 משחק חדש
                  </button>
                  <button
                    onClick={goToSalon}
                    className="px-8 py-4 bg-white hover:bg-purple-50 text-purple-700 text-xl font-bold rounded-2xl shadow-lg transition active:scale-95 border-2 border-purple-200"
                  >
                    🏠 הסלון
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 animate-pulse">⏳ ממתין שהמארח יתחיל...</p>
              )}
            </div>
          )}
        </main>
      )}
    </>
  );
}
