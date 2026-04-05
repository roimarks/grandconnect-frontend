"use client";

export interface CheckersState {
  type: "checkers";
  board: (null | { player: number; king: boolean })[][];
  current_player: number;
  selected: [number, number] | null;
  valid_moves: [number, number][];
  must_capture: boolean;
  multi_jump: boolean;
  captured_counts: [number, number];
  game_over: boolean;
  winner: number | null;
}

interface Props {
  gameState: CheckersState;
  playerId: number;
  onSelectPiece: (row: number, col: number) => void;
  onMovePiece: (toRow: number, toCol: number) => void;
}

const PLAYER_NAMES = ["👴 סבא/סבתא", "🧒 נכד/נכדה"];
const PIECE_COLORS = [
  { bg: "from-red-500 to-red-700", border: "border-red-800", shadow: "shadow-red-400", label: "🔴" },
  { bg: "from-gray-100 to-gray-300", border: "border-gray-500", shadow: "shadow-gray-300", label: "⚪" },
];

export default function Checkers({ gameState, playerId, onSelectPiece, onMovePiece }: Props) {
  const { board, current_player, selected, valid_moves, captured_counts, game_over, winner, multi_jump } = gameState;
  const isMyTurn = current_player === playerId && !game_over;

  const isSelected = (r: number, c: number) =>
    selected !== null && selected[0] === r && selected[1] === c;

  const isValidMove = (r: number, c: number) =>
    valid_moves.some(([vr, vc]) => vr === r && vc === c);

  const handleCellClick = (r: number, c: number) => {
    if (!isMyTurn) return;
    const piece = board[r][c];

    if (isValidMove(r, c)) {
      onMovePiece(r, c);
    } else if (piece && piece.player === playerId) {
      onSelectPiece(r, c);
    }
  };

  // Captured pieces display
  const capturedByMe = captured_counts[playerId];
  const capturedByOpponent = captured_counts[1 - playerId];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center w-full max-w-4xl">
      {/* Board */}
      <div>
        {/* Turn indicator */}
        <div className={`mb-3 text-center px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
          isMyTurn
            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg"
            : game_over
            ? "bg-gray-100 text-gray-500"
            : "bg-gradient-to-r from-orange-200 to-amber-200 text-orange-700"
        }`}>
          {game_over
            ? (winner !== null ? `🏆 ${PLAYER_NAMES[winner]} ניצח/ה!` : "🤝 תיקו!")
            : isMyTurn && multi_jump
            ? "🔥 רב-קפיצה! חייב להמשיך לקפוץ!"
            : isMyTurn
            ? "✨ התור שלך — בחר כלי!"
            : `⏳ תור ${PLAYER_NAMES[current_player]}...`
          }
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            border: "6px solid #78350f",
          }}
        >
          {board.map((row, rIdx) => (
            <div key={rIdx} className="flex">
              {row.map((cell, cIdx) => {
                const isDark = (rIdx + cIdx) % 2 === 1;
                const sel = isSelected(rIdx, cIdx);
                const validDest = isValidMove(rIdx, cIdx);
                const piece = cell;

                let cellBg = isDark ? "bg-amber-900" : "bg-amber-100";
                if (sel) cellBg = "bg-yellow-400";

                return (
                  <div
                    key={cIdx}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                    className={`w-14 h-14 flex items-center justify-center relative cursor-pointer
                      transition-colors duration-150
                      ${cellBg}
                      ${isDark && !sel ? "hover:bg-amber-800" : ""}
                      ${!isDark ? "hover:bg-amber-50" : ""}
                    `}
                  >
                    {/* Valid move indicator */}
                    {validDest && isDark && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-5 h-5 rounded-full bg-green-400 opacity-80 shadow-lg animate-pulse" />
                      </div>
                    )}

                    {/* Piece */}
                    {piece && (
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center z-20
                          bg-gradient-to-br ${PIECE_COLORS[piece.player].bg}
                          border-4 ${PIECE_COLORS[piece.player].border}
                          shadow-lg ${PIECE_COLORS[piece.player].shadow}
                          transition-all duration-200
                          ${sel ? "ring-4 ring-white ring-offset-2 ring-offset-yellow-400 scale-110" : ""}
                          ${isMyTurn && piece.player === playerId && !sel ? "hover:scale-110 hover:ring-2 hover:ring-white" : ""}
                        `}
                      >
                        {piece.king && (
                          <span className="text-lg leading-none select-none" title="מלך">♛</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Info panel */}
      <div className="flex flex-col gap-4 min-w-[200px]">
        {/* Player cards */}
        {[0, 1].map((pid) => (
          <div
            key={pid}
            className={`rounded-2xl p-4 shadow-lg transition-all duration-300 ${
              current_player === pid && !game_over
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white scale-105 ring-2 ring-purple-300"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br
                  ${pid === 0 ? "from-red-400 to-red-600 border-4 border-red-800" : "from-gray-100 to-gray-300 border-4 border-gray-500"}
                  shadow-md`}
              >
                {pid === 0 ? "" : ""}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{PLAYER_NAMES[pid]}</div>
                <div className={`text-xs ${current_player === pid && !game_over ? "text-white/80" : "text-gray-500"}`}>
                  {pid === playerId ? "אתה" : "יריב"}
                </div>
              </div>
              {pid === playerId && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">אתה</span>
              )}
            </div>
            <div className={`mt-2 text-xs ${current_player === pid && !game_over ? "text-white/80" : "text-gray-500"}`}>
              כלים שנלכדו: <span className="font-bold">{captured_counts[pid]}</span>
            </div>
          </div>
        ))}

        {/* Captured pieces visual */}
        <div className="bg-white rounded-2xl p-3 shadow border border-gray-100">
          <div className="text-xs text-gray-500 font-bold mb-2">כלים שנלכדו:</div>
          <div className="flex flex-wrap gap-1 mb-1">
            <span className="text-xs text-gray-500">שלי:</span>
            {Array.from({ length: capturedByMe }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full bg-gradient-to-br ${PIECE_COLORS[1 - playerId].bg} border-2 ${PIECE_COLORS[1 - playerId].border}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-gray-500">יריב:</span>
            {Array.from({ length: capturedByOpponent }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full bg-gradient-to-br ${PIECE_COLORS[playerId].bg} border-2 ${PIECE_COLORS[playerId].border}`}
              />
            ))}
          </div>
        </div>

        {/* Rules reminder */}
        <div className="bg-amber-50 rounded-2xl p-3 text-xs text-amber-800 space-y-1 border border-amber-200">
          <div className="font-bold mb-1">📋 חוקים:</div>
          <div>• נועים באלכסון על ריבועים כהים</div>
          <div>• ♛ מלך — מהלך לכל הכיוונים</div>
          <div>• לכידה חובה כשאפשרית</div>
          <div>• רב-קפיצות מורשות</div>
        </div>

        {/* Win banner */}
        {game_over && winner !== null && (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-center shadow-xl animate-pulse">
            <div className="text-3xl mb-1">🏆</div>
            <div className="font-extrabold text-white">{PLAYER_NAMES[winner]}</div>
            <div className="text-white/90 text-sm">ניצח/ה!</div>
          </div>
        )}
      </div>
    </div>
  );
}
