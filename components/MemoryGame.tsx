"use client";
import { MemoryGameState } from "@/hooks/useGameSocket";

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

export default function MemoryGame({ gameState, playerId, onFlip }: Props) {
  const { cards, current_player, scores, game_over, winner, flipped_indices, theme, pairs } = gameState;
  const isMyTurn = current_player === playerId;
  const hasNames = cards.some(c => c.name);
  const total    = cards.length;   // 16 / 32 / 48

  const waitingForReset =
    flipped_indices.length === 2 &&
    !cards[flipped_indices[0]].matched &&
    !cards[flipped_indices[1]].matched;

  const handleClick = (index: number) => {
    const card = cards[index];
    if (!isMyTurn || card.flipped || card.matched || waitingForReset || game_over) return;
    onFlip(index);
  };

  // ── Dynamic grid & card sizing ───────────────────────────────────────────
  const cols      = total <= 16 ? 4 : 8;
  const cardW     = total <= 16 ? 100 : total <= 32 ? 88 : 78;
  const cardH     = hasNames
    ? (total <= 16 ? 110 : total <= 32 ? 98 : 88)
    : cardW;
  const emojiSize = total <= 16 ? "2.2rem" : total <= 32 ? "1.8rem" : "1.5rem";
  const nameSize  = total <= 16 ? "0.65rem" : "0.6rem";

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* Theme badge */}
      <div className="text-xs font-semibold text-purple-500 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
        {THEME_LABELS[theme] ?? theme} · {pairs} זוגות ({total} קלפים)
      </div>

      {/* Scoreboard */}
      <div className="flex gap-6 text-center">
        {[0, 1].map((pid) => (
          <div
            key={pid}
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
        <div
          className={`text-base font-bold px-5 py-2.5 rounded-full transition-all duration-300 ${
            waitingForReset
              ? "bg-orange-100 text-orange-600 border-2 border-orange-300"
              : isMyTurn
              ? "bg-green-100 text-green-700 border-2 border-green-400 animate-pulse"
              : "bg-gray-100 text-gray-500 border-2 border-gray-200"
          }`}
        >
          {waitingForReset
            ? "🔄 הקלפים חוזרים..."
            : isMyTurn
            ? "✨ התור שלך — בחר קלף!"
            : "⏳ ממתין ליריב..."}
        </div>
      )}

      {/* Game Over Banner */}
      {game_over && (
        <div className="text-center bg-yellow-50 border-4 border-yellow-400 rounded-3xl px-8 py-5 shadow-xl">
          <div className="text-5xl mb-2">🎉</div>
          <div className="text-2xl font-black text-yellow-700">
            {winner === -1
              ? "תיקו! שניכם מנצחים!"
              : winner === playerId
              ? "כל הכבוד — ניצחת! 🏆"
              : "כל הכבוד ליריב! 🏆"}
          </div>
          <div className="text-gray-500 mt-1 text-lg">{scores[0]} — {scores[1]}</div>
        </div>
      )}

      {/* Card Grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, perspective: "800px" }}
      >
        {cards.map((card, index) => {
          const isFlipped   = card.flipped || card.matched;
          const isClickable = isMyTurn && !card.flipped && !card.matched && !game_over && !waitingForReset;
          const isPending   = waitingForReset && flipped_indices.includes(index) && !card.matched;

          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!isClickable}
              style={{ width: cardW, height: cardH }}
              className={`
                rounded-xl font-bold select-none
                transition-all duration-300 flex flex-col items-center justify-center gap-0.5 overflow-hidden
                ${card.matched
                  ? "bg-green-100 border-4 border-green-400"
                  : isFlipped
                  ? isPending
                    ? "bg-white border-4 border-orange-400 shadow-orange-200 shadow-md"
                    : "bg-white border-4 border-blue-300 shadow-sm"
                  : isClickable
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 active:scale-90 cursor-pointer shadow-lg hover:shadow-xl border-4 border-blue-300/50"
                  : "bg-gradient-to-br from-blue-500 to-purple-600 opacity-70 cursor-not-allowed border-4 border-blue-300/30"
                }
              `}
            >
              {isFlipped ? (
                <>
                  <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{card.emoji}</span>
                  {hasNames && card.name && (
                    <span
                      className="font-bold text-gray-700 text-center leading-tight px-0.5"
                      style={{ fontSize: nameSize }}
                    >
                      {card.name}
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: emojiSize, opacity: 0.9 }}>❓</span>
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
