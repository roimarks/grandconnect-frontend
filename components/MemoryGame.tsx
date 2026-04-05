"use client";
import { MemoryGameState } from "@/hooks/useGameSocket";
import { getCardStyle } from "@/lib/cardStyles";

interface Props {
  gameState: MemoryGameState;
  playerId: number;
  onFlip: (index: number) => void;
}

const THEME_LABELS: Record<string, string> = {
  emojis:    "🎭 אמוג'י",
  animals:   "🐾 חיות",
  artists:   "🎨 אמנים",
  inventors: "🔬 ממציאים",
};

// ── CSS keyframes injected once ────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes mem-float-tl{0%,100%{transform:translate(0,0)rotate(0deg)}50%{transform:translate(-4px,-6px)rotate(20deg)}}
  @keyframes mem-float-tr{0%,100%{transform:translate(0,0)rotate(0deg)}50%{transform:translate(4px,-6px)rotate(-20deg)}}
  @keyframes mem-float-bl{0%,100%{transform:translate(0,0)rotate(0deg)}50%{transform:translate(-4px,6px)rotate(-15deg)}}
  @keyframes mem-float-br{0%,100%{transform:translate(0,0)rotate(0deg)}50%{transform:translate(4px,6px)rotate(15deg)}}
  @keyframes mem-flip-in{0%{transform:rotateY(90deg)scale(0.8);opacity:0}60%{transform:rotateY(-8deg)scale(1.05)}100%{transform:rotateY(0deg)scale(1);opacity:1}}
  @keyframes mem-match{0%{transform:scale(1)}30%{transform:scale(1.2)rotate(4deg)}60%{transform:scale(1.15)rotate(-4deg)}100%{transform:scale(1)rotate(0deg)}}
  @keyframes mem-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  @keyframes mem-sparkle{0%{opacity:0;transform:scale(0)rotate(0deg)}50%{opacity:1;transform:scale(1.3)rotate(180deg)}100%{opacity:0;transform:scale(0)rotate(360deg)}}
  @keyframes mem-glow-pulse{0%,100%{box-shadow:0 0 8px 2px var(--glow)}50%{box-shadow:0 0 18px 6px var(--glow)}}
  @keyframes mem-back-shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
  @keyframes mem-emoji-bob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.07)}}
`;

let injected = false;
function injectStyles() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const s = document.createElement("style");
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

// ── Card sizes by total card count ──────────────────────────────────────────
function cardDims(total: number) {
  if (total <= 16) return { w: 120, h: 140, emojiPx: 52, namePx: 11, floatPx: 16 };
  if (total <= 32) return { w: 96,  h: 110, emojiPx: 40, namePx: 10, floatPx: 13 };
  return              { w: 82,  h: 96,  emojiPx: 33, namePx: 9,  floatPx: 11 };
}

// ── Individual card face ────────────────────────────────────────────────────
function CardFace({ emoji, name, matched, dims }: {
  emoji: string; name: string; matched: boolean;
  dims: ReturnType<typeof cardDims>;
}) {
  const style = getCardStyle(name);
  const [f0, f1, f2, f3] = style.floats;
  const fp = dims.floatPx;

  const floatPositions = [
    { top: 4,  left: 4,  anim: "mem-float-tl" },
    { top: 4,  right: 4, anim: "mem-float-tr" },
    { bottom: 4, left: 4,  anim: "mem-float-bl" },
    { bottom: 4, right: 4, anim: "mem-float-br" },
  ];

  return (
    <div
      className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center rounded-xl select-none"
      style={{
        background: style.bg,
        animation: matched
          ? "mem-match 0.5s ease forwards"
          : "mem-flip-in 0.35s ease forwards",
        // @ts-expect-error css variable
        "--glow": style.glow,
        boxShadow: matched
          ? `0 0 14px 4px ${style.glow}88`
          : `0 2px 8px ${style.glow}44`,
      }}
    >
      {/* Corner sparkles when matched */}
      {matched && (
        <>
          {["top-1 left-1","top-1 right-1","bottom-1 left-1","bottom-1 right-1"].map((pos, i) => (
            <span key={i} className={`absolute ${pos} text-yellow-300`}
              style={{ fontSize: fp * 0.8, animation: `mem-sparkle ${0.6 + i * 0.15}s ease ${i * 0.1}s both` }}>
              ✨
            </span>
          ))}
        </>
      )}

      {/* Floating corner emojis */}
      {!matched && [f0, f1, f2, f3].map((fe, i) => (
        <span
          key={i}
          className="absolute opacity-75"
          style={{
            fontSize: fp,
            ...floatPositions[i],
            animation: `${floatPositions[i].anim} ${2 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {fe}
        </span>
      ))}

      {/* Main emoji */}
      <span
        className="relative z-10 drop-shadow-lg"
        style={{
          fontSize: dims.emojiPx,
          lineHeight: 1,
          animation: matched
            ? "mem-emoji-bob 0.8s ease infinite"
            : undefined,
          filter: `drop-shadow(0 2px 6px ${style.glow}88)`,
        }}
      >
        {emoji}
      </span>

      {/* Name label */}
      {name && (
        <div
          className="absolute bottom-0 left-0 right-0 text-center font-black text-white leading-tight px-1 py-1"
          style={{
            fontSize: dims.namePx,
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {name}
        </div>
      )}

      {/* Matched overlay shimmer */}
      {matched && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.25) 50%, transparent 80%)",
            animation: "mem-back-shimmer 1.5s linear infinite",
            backgroundSize: "300% 300%",
          }}
        />
      )}
    </div>
  );
}

// ── Card back ───────────────────────────────────────────────────────────────
function CardBack({ dims, clickable }: { dims: ReturnType<typeof cardDims>; clickable: boolean }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center rounded-xl relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#4f46e5,#7c3aed,#be185d)",
        boxShadow: clickable ? "0 4px 15px rgba(124,58,237,0.5)" : undefined,
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Pattern dots */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="absolute rounded-full opacity-10 bg-white"
          style={{
            width: 20 + i * 8,
            height: 20 + i * 8,
            top: `${10 + i * 14}%`,
            left: `${5 + i * 15}%`,
          }}
        />
      ))}
      <span style={{ fontSize: dims.emojiPx * 0.9, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))", position: "relative", zIndex: 1 }}>
        {clickable ? "❓" : "🔒"}
      </span>
      {clickable && (
        <div className="absolute bottom-1 text-white/60 font-bold" style={{ fontSize: dims.namePx - 1 }}>GC</div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function MemoryGame({ gameState, playerId, onFlip }: Props) {
  injectStyles();

  const { cards, current_player, scores, game_over, winner, flipped_indices, theme, pairs } = gameState;
  const isMyTurn = current_player === playerId;
  const total = cards.length;
  const dims  = cardDims(total);
  const cols  = total <= 16 ? 4 : 8;

  const waitingForReset =
    flipped_indices.length === 2 &&
    !cards[flipped_indices[0]].matched &&
    !cards[flipped_indices[1]].matched;

  const handleClick = (i: number) => {
    const c = cards[i];
    if (!isMyTurn || c.flipped || c.matched || waitingForReset || game_over) return;
    onFlip(i);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full" dir="rtl">

      {/* Theme + size badge */}
      <div className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full border border-purple-200">
        <span>{THEME_LABELS[theme] ?? theme}</span>
        <span className="opacity-40">·</span>
        <span>{pairs} זוגות ({total} קלפים)</span>
      </div>

      {/* Scoreboard */}
      <div className="flex gap-6 text-center">
        {[0, 1].map((pid) => (
          <div key={pid}
            className={`px-6 py-3 rounded-2xl font-bold shadow-md transition-all duration-300 ${
              current_player === pid && !game_over
                ? pid === 0
                  ? "bg-blue-500 text-white scale-110 shadow-blue-200"
                  : "bg-pink-500 text-white scale-110 shadow-pink-200"
                : "bg-white text-gray-700 border-2 border-gray-100"
            }`}
          >
            <div className="text-2xl">{pid === 0 ? "👴" : "🧒"}</div>
            <div className="text-sm font-semibold">{pid === playerId ? "אתה" : "יריב"}</div>
            <div className="text-3xl font-black mt-0.5">{scores[pid]}</div>
          </div>
        ))}
      </div>

      {/* Turn indicator */}
      {!game_over && (
        <div className={`text-base font-bold px-5 py-2.5 rounded-full transition-all duration-300 ${
          waitingForReset
            ? "bg-orange-100 text-orange-600 border-2 border-orange-300"
            : isMyTurn
            ? "bg-green-100 text-green-700 border-2 border-green-400 animate-pulse"
            : "bg-gray-100 text-gray-500 border-2 border-gray-200"
        }`}>
          {waitingForReset ? "🔄 הקלפים חוזרים..." : isMyTurn ? "✨ התור שלך — בחר קלף!" : "⏳ ממתין ליריב..."}
        </div>
      )}

      {/* Game Over */}
      {game_over && (
        <div className="text-center bg-yellow-50 border-4 border-yellow-400 rounded-3xl px-8 py-5 shadow-xl">
          <div className="text-5xl mb-2">🎉</div>
          <div className="text-2xl font-black text-yellow-700">
            {winner === -1 ? "תיקו! שניכם מנצחים!" : winner === playerId ? "כל הכבוד — ניצחת! 🏆" : "כל הכבוד ליריב! 🏆"}
          </div>
          <div className="text-gray-500 mt-1 text-lg">{scores[0]} — {scores[1]}</div>
        </div>
      )}

      {/* Card grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${dims.w}px)`,
          gap: total <= 16 ? 10 : 7,
        }}
      >
        {cards.map((card, i) => {
          const isFlipped   = card.flipped || card.matched;
          const isClickable = isMyTurn && !card.flipped && !card.matched && !game_over && !waitingForReset;
          const isPending   = waitingForReset && flipped_indices.includes(i) && !card.matched;

          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!isClickable && !isFlipped}
              className="rounded-xl overflow-hidden border-0 outline-none focus:outline-none p-0"
              style={{
                width: dims.w,
                height: dims.h,
                cursor: isClickable ? "pointer" : "default",
                animation: isPending ? "mem-shake 0.4s ease" : undefined,
                transform: isClickable ? undefined : undefined,
                transition: "transform 0.1s, box-shadow 0.15s",
                boxShadow: isClickable
                  ? "0 4px 15px rgba(99,102,241,0.4)"
                  : card.matched
                  ? "0 0 12px 3px rgba(74,222,128,0.5)"
                  : "0 1px 4px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={e => { if (isClickable) (e.currentTarget as HTMLElement).style.transform = "scale(1.06) translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              {isFlipped ? (
                <CardFace emoji={card.emoji} name={card.name} matched={card.matched} dims={dims} />
              ) : (
                <CardBack dims={dims} clickable={isClickable} />
              )}
            </button>
          );
        })}
      </div>

      {!isMyTurn && !game_over && (
        <div className="text-sm text-gray-400 font-medium">👆 רק היריב יכול לבחור עכשיו</div>
      )}
    </div>
  );
}
