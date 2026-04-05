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
            {connected ? "🟢 מחובר לשרת" : "🔴 מתחבר לשרת..."}
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
          className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center p-6 text-center"
          style={{ paddingTop: VIDEO_BAR_H + 24, paddingLeft: 288 }}
        >
          {/* Exit button — only here */}
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

          <div className="text-6xl mb-4">{playerId === 0 ? "🏠" : "🚪"}</div>
          <h2 className="text-3xl font-bold text-purple-700 mb-2">
            {playerId === 0 ? "הסלון שלך מוכן!" : "ברוך הבא לסלון!"}
          </h2>

          <div className="my-6 bg-white rounded-3xl shadow-lg px-10 py-6 border-4 border-purple-200">
            <p className="text-gray-400 text-sm mb-2">קוד הסלון לשיתוף</p>
            <div className="text-6xl font-extrabold tracking-widest text-purple-700">{roomCode}</div>
            {playerId === 0 && <p className="text-gray-400 text-sm mt-2">שלח את הקוד הזה לנכד / נכדה 📲</p>}
          </div>

          <div className="flex gap-4 mb-8">
            {[
              { emoji: "👴", active: true },
              { emoji: "🧒", active: effectivePlayerCount >= 2 },
            ].map((p, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-5 py-3 rounded-full shadow text-lg font-semibold ${p.active ? "bg-white text-green-600" : "bg-gray-100 text-gray-400"}`}
              >
                <span className="text-2xl">{p.emoji}</span>
                {p.active ? "✅ מחובר" : "⏳ ממתין..."}
              </div>
            ))}
          </div>

          {playerId === 0 && (
            <div className="mb-6 w-full max-w-2xl">
              <p className="text-gray-500 text-sm mb-3 font-medium">🎮 בחר משחק:</p>

              {/* Memory game with expandable config */}
              <div className="mb-3">
                <button
                  onClick={() => setMemoryConfig(v => !v)}
                  disabled={effectivePlayerCount < 2}
                  className={`w-full py-4 px-3 rounded-2xl text-center font-bold transition border-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${memoryConfig ? "bg-purple-50 border-purple-400 text-purple-700" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50"}`}
                >
                  <div className="text-2xl">🃏</div>
                  <div className="text-sm mt-1">זיכרון</div>
                  <div className="text-xs text-gray-400 mt-0.5">מצא את הזוגות</div>
                </button>

                {memoryConfig && effectivePlayerCount >= 2 && (
                  <div className="mt-2 bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-right" dir="rtl">
                    {/* Pairs */}
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

                    {/* Theme */}
                    <p className="text-xs font-bold text-purple-600 mb-2">נושא:</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { id: "emojis",    label: "🎭 אמוג'י",     desc: "סמלים מהנים" },
                        { id: "animals",   label: "🐾 חיות",        desc: "בעלי חיים" },
                        { id: "artists",   label: "🎨 אמנים",       desc: "אמנים מפורסמים" },
                        { id: "inventors", label: "🔬 ממציאים",     desc: "ממציאים ומדענים" },
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
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-lg rounded-xl shadow-lg transition"
                    >
                      🃏 התחל משחק!
                    </button>
                  </div>
                )}
              </div>

              {/* Other games */}
              <div className="flex gap-2 flex-wrap justify-center mb-5">
                {GAMES.filter(g => g.id !== "memory").map((g) => (
                  <div key={g.id} className="relative flex-1 min-w-[120px]">
                    <button
                      onClick={() => { startGame(g.id); setScreen("game"); sendNavSync("game", g.id); }}
                      disabled={effectivePlayerCount < 2}
                      className="w-full py-4 px-3 rounded-2xl text-center font-bold transition border-4 bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <div className="text-2xl">{g.label.split(" ")[0]}</div>
                      <div className="text-sm mt-1">{g.label.split(" ").slice(1).join(" ")}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{g.desc}</div>
                    </button>
                  </div>
                ))}
              </div>
              {effectivePlayerCount < 2 && (
                <p className="text-gray-400 text-xs text-center mb-2">ממתין לחיבור שני המשתמשים...</p>
              )}

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">או</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 text-center" dir="rtl">
                <div className="text-3xl mb-2">📚</div>
                <p className="text-amber-800 font-bold text-base mb-1">סיפורים משותפים</p>
                <p className="text-amber-600 text-sm mb-3">בחר סיפור לקרוא יחד עם הנכד/ה — עם וידאו!</p>
                <button
                  onClick={() => setScreen("story_library")}
                  disabled={effectivePlayerCount < 2}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-40 text-white text-lg font-bold rounded-2xl shadow-lg transition"
                >
                  📚 בחר סיפור
                </button>
                {effectivePlayerCount < 2 && <p className="text-amber-400 text-xs mt-2">ממתין לחיבור שני המשתמשים...</p>}
              </div>
            </div>
          )}

          {playerId !== 0 && (
            <p className="text-gray-500 text-lg animate-pulse">⏳ ממתין שהמארח יתחיל...</p>
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
          className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center p-6 pb-16"
          style={{ paddingTop: VIDEO_BAR_H + 12, paddingLeft: 288 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full max-w-2xl mb-6">
            <button
              onClick={goToSalon}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 font-bold rounded-2xl shadow transition active:scale-95 border border-purple-100 text-sm"
            >
              🏠 הסלון
            </button>
            <div className="text-xl font-black text-purple-700 tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
              GrandConnect
            </div>
            <div className="text-sm bg-white px-4 py-2 rounded-full text-gray-500 shadow">
              חדר: <span className="font-bold tracking-widest text-purple-700">{roomCode}</span>
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
