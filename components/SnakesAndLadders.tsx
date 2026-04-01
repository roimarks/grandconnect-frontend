"use client";
import { useState, useEffect, useRef } from "react";

export interface SnakesAndLaddersState {
  type: "snakes_and_ladders";
  positions: [number, number];
  current_player: number;
  last_roll: number | null;
  last_event: "snake" | "ladder" | "no_move" | null;
  move_from: number | null;
  move_to: number | null;
  game_over: boolean;
  winner: number | null;
  snakes: Record<string, number>;
  ladders: Record<string, number>;
}

interface Props {
  gameState: SnakesAndLaddersState;
  playerId: number;
  onRoll: () => void;
}

const PLAYER_TOKENS = ["🔴", "🔵"];
const PLAYER_NAMES = ["👴 סבא/סבתא", "🧒 נכד/נכדה"];

// Cell colors cycling rainbow
const CELL_COLORS = [
  "bg-red-200",    "bg-orange-200", "bg-yellow-200", "bg-green-200",
  "bg-teal-200",   "bg-blue-200",   "bg-indigo-200", "bg-purple-200",
  "bg-pink-200",   "bg-rose-200",
];

function squareToCell(sq: number): [number, number] {
  const rowFromBottom = Math.floor((sq - 1) / 10);
  const colInRow = (sq - 1) % 10;
  const col = rowFromBottom % 2 === 0 ? colInRow : 9 - colInRow;
  const row = 9 - rowFromBottom;
  return [row, col];
}

function buildGrid(): number[][] {
  const grid: number[][] = Array.from({ length: 10 }, () => Array(10).fill(0));
  for (let sq = 1; sq <= 100; sq++) {
    const [row, col] = squareToCell(sq);
    grid[row][col] = sq;
  }
  return grid;
}

const GRID = buildGrid();
const CELL_SIZE = 52; // px

function squareToXY(sq: number): { x: number; y: number } {
  const [row, col] = squareToCell(sq);
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}

// Dice pip positions for 1-6
const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function Dice({ value, rolling }: { value: number | null; rolling: boolean }) {
  return (
    <div
      className={`relative w-20 h-20 bg-white rounded-2xl shadow-2xl border-4 border-gray-300 flex items-center justify-center
        ${rolling ? "animate-spin" : ""}
        transition-all duration-300`}
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
        boxShadow: "4px 4px 12px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.8)",
      }}
    >
      {value !== null && !rolling && (
        <svg viewBox="0 0 100 100" className="w-16 h-16">
          {(PIPS[value] || []).map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={9} fill="#1e293b" />
          ))}
        </svg>
      )}
      {rolling && (
        <span className="text-3xl">🎲</span>
      )}
    </div>
  );
}

export default function SnakesAndLadders({ gameState, playerId, onRoll }: Props) {
  const { positions, current_player, last_roll, last_event, game_over, winner, snakes, ladders } = gameState;
  const [rolling, setRolling] = useState(false);
  const [showEvent, setShowEvent] = useState<string | null>(null);
  const prevEventRef = useRef<string | null>(null);
  const isMyTurn = current_player === playerId && !game_over;

  // Show animated event popup
  useEffect(() => {
    if (!last_event || last_event === prevEventRef.current) return;
    prevEventRef.current = last_event;
    let msg = "";
    if (last_event === "snake") msg = `🐍 נחש! ירדת ל-${gameState.move_to}!`;
    else if (last_event === "ladder") msg = `🪜 סולם! עלית ל-${gameState.move_to}!`;
    else if (last_event === "no_move") msg = "⛔ אי אפשר לזוז — מספר גבוה מדי!";
    if (msg) {
      setShowEvent(msg);
      setTimeout(() => setShowEvent(null), 2500);
    }
  }, [last_event, gameState.move_to]);

  const handleRoll = () => {
    if (!isMyTurn || rolling) return;
    setRolling(true);
    setTimeout(() => {
      setRolling(false);
      onRoll();
    }, 900);
  };

  const snakeEntries = Object.entries(snakes).map(([k, v]) => ({ head: Number(k), tail: v }));
  const ladderEntries = Object.entries(ladders).map(([k, v]) => ({ bottom: Number(k), top: v }));

  const boardWidth = 10 * CELL_SIZE;
  const boardHeight = 10 * CELL_SIZE;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-5xl">
      {/* Board + SVG overlay */}
      <div className="relative flex-shrink-0">
        {/* Decorative outer border */}
        <div
          className="rounded-2xl p-1.5"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6, #10b981)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          }}
        >
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Board cells */}
            <div
              className="relative"
              style={{ width: boardWidth, height: boardHeight }}
            >
              {/* Render cells */}
              {GRID.map((row, rowIdx) =>
                row.map((sq, colIdx) => {
                  const playersHere = positions
                    .map((p, i) => (p === sq ? i : -1))
                    .filter((i) => i >= 0);
                  const isSpecial = sq === 100;
                  const colorIdx = (sq - 1) % CELL_COLORS.length;
                  const cellBg = isSpecial
                    ? "bg-yellow-400"
                    : CELL_COLORS[colorIdx];

                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`absolute flex flex-col items-center justify-center border border-white/60 ${cellBg} ${isSpecial ? "ring-2 ring-yellow-600" : ""}`}
                      style={{
                        left: colIdx * CELL_SIZE,
                        top: rowIdx * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                      }}
                    >
                      <span className={`font-bold leading-none ${isSpecial ? "text-sm text-yellow-800" : "text-[10px] text-gray-600"}`}>
                        {sq}
                      </span>
                      {isSpecial && <span className="text-lg leading-none">🏆</span>}
                      {playersHere.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {playersHere.map((pi) => (
                            <span
                              key={pi}
                              className={`text-base leading-none ${pi === playerId ? "drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]" : ""}`}
                            >
                              {PLAYER_TOKENS[pi]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* SVG overlay for snakes and ladders */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={boardWidth}
                height={boardHeight}
              >
                <defs>
                  <marker id="snake-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <circle cx="3" cy="3" r="2" fill="#ef4444" />
                  </marker>
                  <filter id="shadow">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Snakes — bezier curves */}
                {snakeEntries.map(({ head, tail }) => {
                  const { x: x1, y: y1 } = squareToXY(head);
                  const { x: x2, y: y2 } = squareToXY(tail);
                  const mx = (x1 + x2) / 2 + (Math.random() > 0.5 ? 40 : -40);
                  const my = (y1 + y2) / 2;
                  return (
                    <g key={`snake-${head}`} filter="url(#shadow)">
                      <path
                        d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="5"
                        strokeLinecap="round"
                        opacity="0.85"
                      />
                      <path
                        d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                        fill="none"
                        stroke="#fca5a5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="4 6"
                        opacity="0.7"
                      />
                      <text x={x1 - 8} y={y1 - 6} fontSize="16" textAnchor="middle">🐍</text>
                    </g>
                  );
                })}

                {/* Ladders — two parallel lines with rungs */}
                {ladderEntries.map(({ bottom, top }) => {
                  const { x: bx, y: by } = squareToXY(bottom);
                  const { x: tx, y: ty } = squareToXY(top);
                  const dx = tx - bx;
                  const dy = ty - by;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const ux = (dx / len) * 6;
                  const uy = (dy / len) * 6;
                  const px = -uy;
                  const py = ux;
                  // Ladder rails
                  const steps = Math.floor(len / 16);
                  return (
                    <g key={`ladder-${bottom}`} filter="url(#shadow)">
                      {/* Left rail */}
                      <line
                        x1={bx - px} y1={by - py}
                        x2={tx - px} y2={ty - py}
                        stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" opacity="0.85"
                      />
                      {/* Right rail */}
                      <line
                        x1={bx + px} y1={by + py}
                        x2={tx + px} y2={ty + py}
                        stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" opacity="0.85"
                      />
                      {/* Rungs */}
                      {Array.from({ length: steps }, (_, i) => {
                        const t2 = (i + 1) / (steps + 1);
                        const rx = bx + dx * t2;
                        const ry = by + dy * t2;
                        return (
                          <line
                            key={i}
                            x1={rx - px * 1.3} y1={ry - py * 1.3}
                            x2={rx + px * 1.3} y2={ry + py * 1.3}
                            stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
                          />
                        );
                      })}
                      <text x={bx - 8} y={by + 6} fontSize="14" textAnchor="middle">🪜</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="flex flex-col gap-4 min-w-[220px] max-w-xs w-full">
        {/* Players */}
        {[0, 1].map((pid) => (
          <div
            key={pid}
            className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 ${
              current_player === pid && !game_over
                ? pid === 0
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white scale-105 ring-2 ring-red-300"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-105 ring-2 ring-blue-300"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{PLAYER_TOKENS[pid]}</span>
              <div className="flex-1">
                <div className="font-bold text-sm">{PLAYER_NAMES[pid]}</div>
                <div className="text-xs opacity-80">
                  {positions[pid] === 0 ? "התחלה" : `משבצת ${positions[pid]}`}
                </div>
              </div>
              {pid === playerId && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">אתה</span>
              )}
            </div>
          </div>
        ))}

        {/* Dice area */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center gap-3 border border-purple-100">
          <Dice value={last_roll} rolling={rolling} />
          {last_roll !== null && !rolling && (
            <div className="text-center text-sm text-gray-600">
              הוטל: <span className="font-bold text-purple-700 text-lg">{last_roll}</span>
            </div>
          )}
          {!game_over && (
            <button
              onClick={handleRoll}
              disabled={!isMyTurn || rolling}
              className={`w-full py-3 rounded-2xl text-lg font-extrabold shadow-lg transition-all active:scale-95 ${
                isMyTurn && !rolling
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {rolling ? "🎲 מטיל..." : isMyTurn ? "🎲 הטל קובייה!" : "⏳ תור היריב..."}
            </button>
          )}
        </div>

        {/* Win message */}
        {game_over && winner !== null && (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-4 text-center shadow-xl animate-bounce">
            <div className="text-4xl mb-1">🏆</div>
            <div className="font-extrabold text-white text-lg">{PLAYER_NAMES[winner]}</div>
            <div className="text-white/90 text-sm font-bold">ניצח/ה!</div>
          </div>
        )}

        {/* Event history hint */}
        {last_roll !== null && last_event && !showEvent && (
          <div className={`rounded-2xl px-4 py-2 text-sm font-semibold text-center ${
            last_event === "snake" ? "bg-red-100 text-red-700" :
            last_event === "ladder" ? "bg-green-100 text-green-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {last_event === "snake" && `🐍 נחש! ${gameState.move_from} → ${gameState.move_to}`}
            {last_event === "ladder" && `🪜 סולם! ${gameState.move_from} → ${gameState.move_to}`}
            {last_event === "no_move" && "⛔ לא ניתן לזוז"}
          </div>
        )}

        {/* Legend */}
        <div className="bg-white/80 rounded-2xl p-3 text-xs text-gray-500 space-y-1">
          <div className="font-bold text-gray-600 mb-1">מקרא:</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1.5 rounded" style={{ background: "#ef4444" }} />
            <span>נחש (יורד)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1.5 rounded" style={{ background: "#16a34a" }} />
            <span>סולם (עולה)</span>
          </div>
        </div>
      </div>

      {/* Event popup */}
      {showEvent && (
        <div
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 rounded-3xl shadow-2xl text-xl font-extrabold text-white text-center animate-bounce"
          style={{
            background: last_event === "snake"
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : last_event === "ladder"
              ? "linear-gradient(135deg, #16a34a, #15803d)"
              : "linear-gradient(135deg, #6b7280, #4b5563)",
            animation: "slideInFromTop 0.3s ease-out",
          }}
        >
          {showEvent}
        </div>
      )}

      <style>{`
        @keyframes slideInFromTop {
          from { transform: translateX(-50%) translateY(-60px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
