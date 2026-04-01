"use client";
import { useState } from "react";

export interface DotsAndBoxesState {
  type: "dots_and_boxes";
  size: number;
  h_lines: boolean[][];
  v_lines: boolean[][];
  boxes: (number | null)[][];
  current_player: number;
  scores: [number, number];
  last_line: { type: "h" | "v"; row: number; col: number } | null;
  game_over: boolean;
  winner: number | null | -1;
}

interface Props {
  gameState: DotsAndBoxesState;
  playerId: number;
  onDrawLine: (lineType: "h" | "v", row: number, col: number) => void;
}

const PLAYER_COLORS = [
  { fill: "#7c3aed", light: "#ede9fe", label: "🟣", name: "סגול" },
  { fill: "#2563eb", light: "#dbeafe", label: "🔵", name: "כחול" },
];
const PLAYER_NAMES = ["👴 סבא/סבתא", "🧒 נכד/נכדה"];

const DOT_R = 5;
const CELL = 52; // px per cell
const PADDING = 20;

export default function DotsAndBoxes({ gameState, playerId, onDrawLine }: Props) {
  const { size, h_lines, v_lines, boxes, current_player, scores, last_line, game_over, winner } = gameState;
  const [hovered, setHovered] = useState<{ type: "h" | "v"; row: number; col: number } | null>(null);
  const isMyTurn = current_player === playerId && !game_over;

  const svgW = PADDING + size * CELL + PADDING;
  const svgH = PADDING + size * CELL + PADDING;

  // Dot position
  const dx = (col: number) => PADDING + col * CELL;
  const dy = (row: number) => PADDING + row * CELL;

  // Is this the last drawn line?
  const isLastLine = (type: "h" | "v", row: number, col: number) =>
    last_line?.type === type && last_line.row === row && last_line.col === col;

  const isHovered = (type: "h" | "v", row: number, col: number) =>
    hovered?.type === type && hovered.row === row && hovered.col === col;

  const handleHLine = (row: number, col: number) => {
    if (!isMyTurn || h_lines[row][col]) return;
    onDrawLine("h", row, col);
  };

  const handleVLine = (row: number, col: number) => {
    if (!isMyTurn || v_lines[row][col]) return;
    onDrawLine("v", row, col);
  };

  const totalBoxes = size * size;
  const filledBoxes = boxes.flat().filter((b) => b !== null).length;
  const progressPct = (filledBoxes / totalBoxes) * 100;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-4xl">
      {/* Board */}
      <div className="flex flex-col items-center">
        {/* Turn indicator */}
        <div className={`mb-3 px-5 py-2 rounded-2xl font-bold text-sm transition-all ${
          game_over
            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
            : isMyTurn
            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow"
            : "bg-orange-100 text-orange-700"
        }`}>
          {game_over
            ? (winner === -1 ? "🤝 תיקו!" : winner !== null ? `🏆 ${PLAYER_NAMES[winner as number]} ניצח/ה!` : "")
            : isMyTurn
            ? "✨ התור שלך — צייר קו!"
            : `⏳ תור ${PLAYER_NAMES[current_player]}...`
          }
        </div>

        {/* SVG Board */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: "3px solid #e2e8f0",
          }}
        >
          <svg
            width={svgW}
            height={svgH}
            style={{ display: "block" }}
          >
            {/* Box fills */}
            {Array.from({ length: size }).map((_, br) =>
              Array.from({ length: size }).map((_, bc) => {
                const owner = boxes[br][bc];
                if (owner === null) return null;
                const color = PLAYER_COLORS[owner as number];
                return (
                  <rect
                    key={`box-${br}-${bc}`}
                    x={dx(bc) + 1}
                    y={dy(br) + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    fill={color.light}
                    stroke={color.fill}
                    strokeWidth="1"
                    rx="4"
                    style={{ transition: "fill 0.3s ease" }}
                  >
                    <animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze" />
                  </rect>
                );
              })
            )}

            {/* Box owner emoji */}
            {Array.from({ length: size }).map((_, br) =>
              Array.from({ length: size }).map((_, bc) => {
                const owner = boxes[br][bc];
                if (owner === null) return null;
                const color = PLAYER_COLORS[owner as number];
                return (
                  <text
                    key={`box-label-${br}-${bc}`}
                    x={dx(bc) + CELL / 2}
                    y={dy(br) + CELL / 2 + 5}
                    textAnchor="middle"
                    fontSize="18"
                    fill={color.fill}
                    fontWeight="bold"
                  >
                    {color.label}
                  </text>
                );
              })
            )}

            {/* Horizontal lines */}
            {h_lines.map((rowArr, row) =>
              rowArr.map((drawn, col) => {
                const x1 = dx(col) + DOT_R;
                const y1 = dy(row);
                const x2 = dx(col + 1) - DOT_R;
                const y2 = dy(row);
                const hovering = isHovered("h", row, col);
                const isLast = isLastLine("h", row, col);
                const canDraw = isMyTurn && !drawn;

                return (
                  <g key={`hl-${row}-${col}`}>
                    {/* Invisible thick hit area */}
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      strokeWidth="16"
                      stroke="transparent"
                      style={{ cursor: canDraw ? "pointer" : "default" }}
                      onMouseEnter={() => canDraw && setHovered({ type: "h", row, col })}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleHLine(row, col)}
                    />
                    {/* Visible line */}
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      strokeWidth={drawn ? 4 : hovering ? 3 : 2}
                      stroke={
                        drawn
                          ? isLast
                            ? PLAYER_COLORS[1 - current_player === playerId ? playerId : 1 - playerId].fill
                            : "#475569"
                          : hovering
                          ? PLAYER_COLORS[playerId].fill + "99"
                          : "#cbd5e1"
                      }
                      strokeLinecap="round"
                      style={{
                        pointerEvents: "none",
                        transition: "stroke 0.2s, stroke-width 0.2s",
                        strokeDasharray: drawn ? "none" : hovering ? "4 3" : "none",
                      }}
                    />
                  </g>
                );
              })
            )}

            {/* Vertical lines */}
            {v_lines.map((rowArr, row) =>
              rowArr.map((drawn, col) => {
                const x1 = dx(col);
                const y1 = dy(row) + DOT_R;
                const x2 = dx(col);
                const y2 = dy(row + 1) - DOT_R;
                const hovering = isHovered("v", row, col);
                const isLast = isLastLine("v", row, col);
                const canDraw = isMyTurn && !drawn;

                return (
                  <g key={`vl-${row}-${col}`}>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      strokeWidth="16"
                      stroke="transparent"
                      style={{ cursor: canDraw ? "pointer" : "default" }}
                      onMouseEnter={() => canDraw && setHovered({ type: "v", row, col })}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleVLine(row, col)}
                    />
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      strokeWidth={drawn ? 4 : hovering ? 3 : 2}
                      stroke={
                        drawn
                          ? isLast
                            ? PLAYER_COLORS[1 - current_player === playerId ? playerId : 1 - playerId].fill
                            : "#475569"
                          : hovering
                          ? PLAYER_COLORS[playerId].fill + "99"
                          : "#cbd5e1"
                      }
                      strokeLinecap="round"
                      style={{
                        pointerEvents: "none",
                        transition: "stroke 0.2s, stroke-width 0.2s",
                        strokeDasharray: drawn ? "none" : hovering ? "4 3" : "none",
                      }}
                    />
                  </g>
                );
              })
            )}

            {/* Dots */}
            {Array.from({ length: size + 1 }).map((_, row) =>
              Array.from({ length: size + 1 }).map((_, col) => (
                <circle
                  key={`dot-${row}-${col}`}
                  cx={dx(col)}
                  cy={dy(row)}
                  r={DOT_R}
                  fill="#1e293b"
                />
              ))
            )}
          </svg>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>קופסאות מלאות: {filledBoxes}/{totalBoxes}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #7c3aed, #2563eb)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="flex flex-col gap-4 min-w-[200px]">
        {/* Score cards */}
        {[0, 1].map((pid) => (
          <div
            key={pid}
            className={`rounded-2xl p-4 shadow-lg transition-all duration-300 ${
              current_player === pid && !game_over
                ? "scale-105 ring-2"
                : "border border-gray-200"
            }`}
            style={
              current_player === pid && !game_over
                ? {
                    background: `linear-gradient(135deg, ${PLAYER_COLORS[pid].fill}, ${pid === 0 ? "#5b21b6" : "#1d4ed8"})`,
                    color: "white",
                  }
                : { background: "white" }
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow"
                  style={{ background: PLAYER_COLORS[pid].fill }}
                >
                  {PLAYER_COLORS[pid].label}
                </div>
                <div>
                  <div className="font-bold text-sm">{PLAYER_NAMES[pid]}</div>
                  <div className={`text-xs ${current_player === pid && !game_over ? "text-white/70" : "text-gray-400"}`}>
                    {pid === playerId ? "אתה" : "יריב"}
                  </div>
                </div>
              </div>
              <div className={`text-3xl font-extrabold ${current_player === pid && !game_over ? "text-white" : ""}`}
                style={current_player !== pid || game_over ? { color: PLAYER_COLORS[pid].fill } : {}}>
                {scores[pid]}
              </div>
            </div>
          </div>
        ))}

        {/* Rules reminder */}
        <div className="bg-blue-50 rounded-2xl p-3 text-xs text-blue-800 space-y-1 border border-blue-100">
          <div className="font-bold mb-1">📋 חוקים:</div>
          <div>• צייר קו בין שתי נקודות</div>
          <div>• סגרת קופסא? תור נוסף!</div>
          <div>• הכי הרבה קופסאות — מנצח!</div>
        </div>

        {/* Win banner */}
        {game_over && (
          <div
            className="rounded-2xl p-4 text-center shadow-xl animate-bounce"
            style={{
              background: winner === -1
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : winner !== null
                ? `linear-gradient(135deg, ${PLAYER_COLORS[winner as number].fill}, #1e293b)`
                : "white",
            }}
          >
            <div className="text-3xl mb-1">{winner === -1 ? "🤝" : "🏆"}</div>
            <div className="font-extrabold text-white">
              {winner === -1 ? "תיקו!" : winner !== null ? PLAYER_NAMES[winner as number] : ""}
            </div>
            {winner !== -1 && winner !== null && (
              <div className="text-white/80 text-sm">ניצח/ה!</div>
            )}
            <div className="text-white/70 text-xs mt-1">{scores[0]} — {scores[1]}</div>
          </div>
        )}
      </div>
    </div>
  );
}
