"use client";
import { ConnectFourState } from "@/hooks/useGameSocket";

interface Props {
  gameState: ConnectFourState;
  playerId: number;
  onDrop: (col: number) => void;
}

const PIECE = ["bg-red-500", "bg-yellow-400"];
const PIECE_LABEL = ["🔴 סבא / סבתא", "🟡 נכד / נכדה"];

export default function ConnectFour({ gameState, playerId, onDrop }: Props) {
  const { board, current_player, winner, game_over, winning_cells } = gameState;
  const isMyTurn = current_player === playerId;

  const isWinningCell = (row: number, col: number) =>
    winning_cells.some(([r, c]) => r === row && c === col);

  const isColFull = (col: number) => board[0][col] !== null;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Scoreboard */}
      <div className="flex gap-8">
        {[0, 1].map((pid) => (
          <div
            key={pid}
            className={`px-6 py-3 rounded-2xl text-lg font-bold shadow transition-all ${
              current_player === pid && !game_over
                ? pid === 0
                  ? "bg-red-500 text-white scale-105"
                  : "bg-yellow-400 text-gray-900 scale-105"
                : "bg-white text-gray-700 border-2 border-gray-200"
            }`}
          >
            <div className="text-2xl">{pid === 0 ? "🔴" : "🟡"}</div>
            <div className="text-sm mt-1">{pid === playerId ? "אתה" : "יריב"}</div>
          </div>
        ))}
      </div>

      {/* Turn indicator */}
      {!game_over && (
        <div
          className={`text-lg font-semibold px-4 py-2 rounded-full ${
            isMyTurn ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {isMyTurn ? "✨ התור שלך — בחר עמודה!" : "⏳ ממתין ליריב..."}
        </div>
      )}

      {/* Game Over Banner */}
      {game_over && (
        <div className="text-center bg-yellow-50 border-4 border-yellow-400 rounded-3xl px-8 py-4">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-2xl font-bold text-yellow-700">
            {winner === -1
              ? "תיקו!"
              : winner === playerId
              ? "כל הכבוד — ניצחת! 🏆"
              : "כל הכבוד ליריב! 🏆"}
          </div>
        </div>
      )}

      {/* Board */}
      <div className="bg-blue-700 p-3 rounded-3xl shadow-2xl select-none">
        {/* Drop buttons */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array.from({ length: 7 }, (_, col) => {
            const canDrop = isMyTurn && !isColFull(col) && !game_over;
            return (
              <button
                key={col}
                onClick={() => onDrop(col)}
                disabled={!canDrop}
                className={`h-8 w-14 rounded-lg text-lg transition-all ${
                  canDrop
                    ? playerId === 0
                      ? "bg-red-400 hover:bg-red-300 active:scale-95 cursor-pointer"
                      : "bg-yellow-300 hover:bg-yellow-200 active:scale-95 cursor-pointer"
                    : "opacity-0 cursor-default"
                }`}
              >
                ▼
              </button>
            );
          })}
        </div>

        {/* Grid cells */}
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-7 gap-2 mb-2">
            {row.map((cell, colIdx) => {
              const winning = isWinningCell(rowIdx, colIdx);
              const canClick = isMyTurn && !isColFull(colIdx) && !game_over;
              return (
                <div
                  key={colIdx}
                  onClick={() => { if (canClick) onDrop(colIdx); }}
                  className={`w-14 h-14 rounded-full transition-all duration-300 ${
                    canClick ? "cursor-pointer" : "cursor-default"
                  } ${
                    winning ? "ring-4 ring-white ring-offset-1 ring-offset-blue-700 animate-pulse" : ""
                  } ${
                    cell === 0
                      ? "bg-red-500 shadow-inner"
                      : cell === 1
                      ? "bg-yellow-400 shadow-inner"
                      : "bg-blue-900"
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm text-gray-500">
        {[0, 1].map((pid) => (
          <div key={pid} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${PIECE[pid]}`} />
            <span>{PIECE_LABEL[pid]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
