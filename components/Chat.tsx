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
const QUICK_EMOJIS  = ["❤️", "😄", "😂", "👍", "🎉", "🤗", "👴", "🧒"];

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => ctx.close();
  } catch { /* ignore */ }
}

export default function Chat({ playerId, messages, onSend, onTyping, typingIndicator }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCountRef = useRef(0);

  // Beep on new messages from other player
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const newMsgs = messages.slice(prevCountRef.current);
      if (newMsgs.some((m) => m.player_id !== playerId)) playBeep();
    }
    prevCountRef.current = messages.length;
  }, [messages, playerId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  }, [input, onSend]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    onTyping?.();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white border-r border-purple-100 shadow-xl"
      style={{ width: 280, paddingTop: 160 }}
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 font-bold text-sm flex items-center gap-2 flex-shrink-0">
        <span className="text-lg">💬</span>
        <span>צ׳אט</span>
        {typingIndicator && (
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse mr-auto">
            {PLAYER_LABELS[1 - playerId]} מקליד...
          </span>
        )}
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
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs flex-shrink-0">
                  {PLAYER_LABELS[msg.player_id]}
                </div>
              )}
              <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[80%]`}>
                <div className={`px-3 py-1.5 rounded-2xl text-sm leading-snug ${
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
      <div className="border-t border-gray-100 px-2 py-1 flex gap-1 flex-wrap flex-shrink-0">
        {QUICK_EMOJIS.map((emoji) => (
          <button key={emoji} onClick={() => insertEmoji(emoji)}
            className="text-base hover:scale-125 transition-transform active:scale-95">
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
          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-40 active:scale-95">
          ➤
        </button>
      </div>
    </div>
  );
}
