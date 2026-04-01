"use client";
import { MemoryGameState } from "@/hooks/useGameSocket";

interface Props {
  gameState: MemoryGameState;
  playerId: number;
  onFlip: (index: number) => void;
}

export default function MemoryGame({ gameState, playerId, onFlip }: Props) {
  const { cards, current_player, scores, game_over, winner, flipped_indices } = gameState;
  const isMyTurn = current_player === playerId;

  const waitingForReset =
    flipped_indices.length === 2 &&
    !cards[flipped_indices[0]].matched &&
    !cards[flipped_indices[1]].matched;

  const handleClick = (index: number) => {
    const card = cards[index];
    if (!isMyTurn || card.flipped || card.matched || waitingForReset) return;
    onFlip(index);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
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
        <div className="text-center bg-yellow-50 border-4 border-yellow-400 rounded-3xl px-8 py-5 shadow-xl animate-fade-up">
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
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          perspective: "800px",
        }}
      >
        {cards.map((card, index) => {
          const isFlipped    = card.flipped || card.matched;
          const isClickable  = isMyTurn && !card.flipped && !card.matched && !game_over && !waitingForReset;
          const isPending    = waitingForReset && flipped_indices.includes(index) && !card.matched;

          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!isClickable}
              className={`
                w-[72px] h-[72px] rounded-2xl text-3xl font-bold select-none
                transition-all duration-300 relative
                ${card.matched
                  ? "bg-green-100 border-4 border-green-400 animate-match"
                  : isFlipped
                  ? isPending
                    ? "bg-white border-4 border-orange-400 shadow-orange-200 shadow-md"
                    : "bg-white border-4 border-blue-300 shadow-sm animate-card-flip-in"
                  : isClickable
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 active:scale-90 cursor-pointer shadow-lg hover:shadow-xl border-4 border-blue-300/50"
                  : "bg-gradient-to-br from-blue-500 to-purple-600 opacity-70 cursor-not-allowed border-4 border-blue-300/30"
                }
              `}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {isFlipped
                ? card.matched
                  ? <span style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>{card.emoji}</span>
                  : card.emoji
                : <span style={{ fontSize: "1.4rem", opacity: 0.9 }}>❓</span>
              }
            </button>
          );
        })}
      </div>

      {/* Dim overlay when not your turn */}
      {!isMyTurn && !game_over && (
        <div className="text-sm text-gray-400 font-medium">
          👆 רק היריב יכול לבחור עכשיו
        </div>
      )}
    </div>
  );
}
