"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export interface ChatMessage {
  player_id: number;
  text: string;
  time: string;
}

interface Props {
  playerId: number;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onTyping?: () => void;
  typingIndicator?: boolean;
}

const PLAYER_LABELS = ["👴", "🧒"];
const PLAYER_NAMES  = ["סבא/סבתא", "נכד/נכדה"];
const QUICK_EMOJIS  = ["❤️", "😄", "😂", "👍", "🎉", "🤗", "👴", "🧒"];

const CHAT_W = 300;
const CHAT_BTN_H = 56;

type SnapZone = "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "right" | "left";

function getSnapZone(cx: number, cy: number): SnapZone | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const EDGE = 120;
  if (cy > vh - EDGE && cx > vw - EDGE) return "bottom-right";
  if (cy > vh - EDGE && cx < EDGE)      return "bottom-left";
  if (cy > vh - EDGE)                   return "bottom-center";
  if (cy < EDGE && cx > vw - EDGE)      return "top-right";
  if (cy < EDGE && cx < EDGE)           return "top-left";
  if (cx > vw - EDGE)                   return "right";
  if (cx < EDGE)                        return "left";
  return null;
}

function getSnapPosition(zone: SnapZone): { x: number; y: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  switch (zone) {
    case "bottom-right":  return { x: vw - CHAT_W - 8,     y: vh - CHAT_BTN_H - 8 };
    case "bottom-left":   return { x: 8,                   y: vh - CHAT_BTN_H - 8 };
    case "bottom-center": return { x: vw / 2 - CHAT_W / 2, y: vh - CHAT_BTN_H - 8 };
    case "top-right":     return { x: vw - CHAT_W - 8,     y: 8 };
    case "top-left":      return { x: 8,                   y: 8 };
    case "right":         return { x: vw - CHAT_W - 8,     y: vh / 2 - CHAT_BTN_H / 2 };
    case "left":          return { x: 8,                   y: vh / 2 - CHAT_BTN_H / 2 };
  }
}

const SNAP_LABELS: Record<SnapZone, string> = {
  "bottom-right": "↘", "bottom-left": "↙", "bottom-center": "↓",
  "top-right": "↗", "top-left": "↖", "right": "→", "left": "←",
};

const SNAP_STYLES: Record<SnapZone, React.CSSProperties> = {
  "bottom-right":  { bottom: 8, right: 8,    width: 100, height: 70 },
  "bottom-left":   { bottom: 8, left: 8,     width: 100, height: 70 },
  "bottom-center": { bottom: 8, left: "50%", transform: "translateX(-50%)", width: 120, height: 50 },
  "top-right":     { top: 8,   right: 8,    width: 100, height: 70 },
  "top-left":      { top: 8,   left: 8,     width: 100, height: 70 },
  "right":         { top: "50%", right: 8,  transform: "translateY(-50%)", width: 60, height: 80 },
  "left":          { top: "50%", left: 8,   transform: "translateY(-50%)", width: 60, height: 80 },
};

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => ctx.close();
  } catch { /* ignore */ }
}

export default function Chat({ playerId, messages, onSend, onTyping, typingIndicator }: Props) {
  const [open,   setOpen]   = useState(false);
  const [input,  setInput]  = useState("");
  const [unread, setUnread] = useState(0);
  const [size,   setSize]   = useState({ w: CHAT_W, h: 340 });
  const [pos,    setPos]    = useState<{ x: number; y: number } | null>(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [activeZone,  setActiveZone]  = useState<SnapZone | null>(null);

  const bottomRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const prevCountRef   = useRef(0);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizing       = useRef(false);
  const resizeStart    = useRef({ x: 0, y: 0, w: CHAT_W, h: 340 });
  const dragging       = useRef(false);
  const dragOffset     = useRef({ x: 0, y: 0 });

  // Initial position: bottom-right
  useEffect(() => {
    setPos({ x: window.innerWidth - CHAT_W - 8, y: window.innerHeight - CHAT_BTN_H - 8 });
  }, []);

  // ── Drag handle ────────────────────────────────────────────────────────────
  const onDragMouseDown = (e: React.MouseEvent) => {
    if (!pos) return;
    dragging.current = true;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      setPos({ x: newX, y: newY });
      setActiveZone(getSnapZone(newX + CHAT_W / 2, newY + CHAT_BTN_H / 2));
    };
    const onUp = (e: MouseEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      const zone = getSnapZone(newX + CHAT_W / 2, newY + CHAT_BTN_H / 2);
      if (zone) setPos(getSnapPosition(zone));
      setActiveZone(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  // ── Resize ─────────────────────────────────────────────────────────────────
  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    resizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const dw = e.clientX - resizeStart.current.x;
      const dh = -(e.clientY - resizeStart.current.y);
      setSize({
        w: Math.max(250, Math.min(500, resizeStart.current.w + dw)),
        h: Math.max(200, Math.min(600, resizeStart.current.h + dh)),
      });
    };
    const onUp = () => { resizing.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  // ── Unread + beep ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const newMsgs = messages.slice(prevCountRef.current);
      const fromOther = newMsgs.some((m) => m.player_id !== playerId);
      if (fromOther) {
        if (!open) setUnread((u) => u + newMsgs.filter((m) => m.player_id !== playerId).length);
        playBeep();
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, open, playerId]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [open, messages.length]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  }, [input, onSend]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (onTyping) { onTyping(); if (typingTimerRef.current) clearTimeout(typingTimerRef.current); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const insertEmoji = (emoji: string) => { setInput((prev) => prev + emoji); inputRef.current?.focus(); };
  const otherName   = PLAYER_NAMES[1 - playerId];
  const otherLabel  = PLAYER_LABELS[1 - playerId];

  if (pos === null) return null;

  // Determine if chat panel opens upward or downward based on y position
  const opensUp = pos.y > window.innerHeight / 2;

  return (
    <>
      {/* Snap zone overlay while dragging */}
      {isDragging && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {(Object.keys(SNAP_STYLES) as SnapZone[]).map((zone) => (
            <div key={zone}
              className={`absolute rounded-2xl border-2 flex items-center justify-center transition-all duration-150 ${
                activeZone === zone
                  ? "bg-indigo-400/50 border-indigo-400 scale-110"
                  : "bg-white/10 border-white/20"
              }`}
              style={SNAP_STYLES[zone]}
            >
              <span className={`text-sm font-bold ${activeZone === zone ? "text-white" : "text-white/40"}`}>
                {SNAP_LABELS[zone]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="fixed z-50 select-none" style={{ left: pos.x, top: pos.y }}>
        {/* Chat panel — opens above or below button */}
        {open && (
          <div
            className={`mb-2 bg-white rounded-2xl shadow-2xl border border-purple-200 flex flex-col overflow-hidden relative ${opensUp ? "absolute bottom-full mb-2" : ""}`}
            style={{ width: size.w, height: size.h, ...(opensUp ? { bottom: CHAT_BTN_H + 8, top: "auto" } : {}) }}
          >
            {/* Resize handle */}
            <div onMouseDown={onResizeMouseDown}
              className="absolute top-0 right-0 w-6 h-6 cursor-nw-resize z-10 flex items-center justify-center"
              title="שנה גודל">
              <svg width="12" height="12" viewBox="0 0 12 12" className="opacity-40 hover:opacity-70">
                <path d="M2 10 L10 2 M6 10 L10 6" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Header with drag handle */}
            <div onMouseDown={onDragMouseDown}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 font-bold text-sm flex justify-between items-center flex-shrink-0 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2">
                <span>💬 צ׳אט</span>
                <span className="text-[10px] text-purple-200 font-normal">⠿ גרור</span>
                {typingIndicator && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
                    {otherLabel} {otherName} מקליד...
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">×</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
              {messages.length === 0 && (
                <p className="text-gray-400 text-xs text-center mt-4">אין הודעות עדיין... 👋</p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.player_id === playerId;
                return (
                  <div key={i} className={`flex items-end gap-1.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center text-sm flex-shrink-0">
                        {PLAYER_LABELS[msg.player_id]}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[75%]`}>
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-snug shadow-sm ${
                        isMine
                          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Quick emojis */}
            <div className="border-t border-gray-100 px-2 pt-1.5 flex gap-1 flex-shrink-0">
              {QUICK_EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => insertEmoji(emoji)}
                  className="text-lg hover:scale-125 transition-transform active:scale-95 select-none" title={emoji}>
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-2 flex gap-2 flex-shrink-0">
              <input ref={inputRef} type="text" value={input} onChange={handleInputChange} onKeyDown={onKey}
                placeholder="כתוב הודעה..." maxLength={300}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                dir="auto" />
              <button onClick={send} disabled={!input.trim()}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-40 active:scale-95">
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Toggle button + drag handle when closed */}
        <div
          onMouseDown={!open ? onDragMouseDown : undefined}
          className={!open ? "cursor-grab active:cursor-grabbing" : ""}
        >
          <button
            onClick={() => setOpen(!open)}
            className={`relative text-white shadow-2xl flex items-center justify-center gap-2 transition active:scale-95 font-bold bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700
              ${open ? "w-14 h-14 rounded-full text-xl" : "px-5 h-14 rounded-2xl text-base"}`}
          >
            {open
              ? "✕"
              : <><span className="text-xl">💬</span><span>צ׳אט</span></>
            }
            {unread > 0 && !open && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {unread}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
