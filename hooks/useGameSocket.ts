"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ChatMessage } from "@/components/Chat";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardState {
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export interface MemoryGameState {
  type: "memory";
  cards: CardState[];
  current_player: number;
  scores: [number, number];
  flipped_indices: number[];
  game_over: boolean;
  winner: number | null;
}

export interface ConnectFourState {
  type: "connect_four";
  board: (number | null)[][];
  current_player: number;
  winner: number | null;
  game_over: boolean;
  winning_cells: [number, number][];
  last_drop: [number, number] | null;
}

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

export interface CheckersState {
  type: "checkers";
  board: (null | { player: number; king: boolean })[][];
  current_player: number;
  selected: [number, number] | null;
  valid_moves: [number, number][];
  must_capture: boolean;
  captured_counts: [number, number];
  game_over: boolean;
  winner: number | null;
}

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

export type GameState =
  | MemoryGameState
  | ConnectFourState
  | SnakesAndLaddersState
  | CheckersState
  | DotsAndBoxesState;

// ─── Story state ──────────────────────────────────────────────────────────────

export interface StoryState {
  storyId: string | null;
  page: number;
  highlight: number | null;
}

// ─── Hook return type ─────────────────────────────────────────────────────────

interface UseGameSocketReturn {
  connected: boolean;
  roomCode: string | null;
  playerId: number | null;
  playerCount: number;
  gameState: GameState | null;
  gameType: string | null;
  error: string | null;
  incomingSignal: object | null;
  chatMessages: ChatMessage[];
  typingIndicator: boolean;
  storyState: StoryState | null;
  createRoom: () => void;
  joinRoom: (code: string) => void;
  startGame: (gameType: string) => void;
  flipCard: (index: number) => void;
  dropPiece: (col: number) => void;
  rollDice: () => void;
  selectPiece: (row: number, col: number) => void;
  movePiece: (toRow: number, toCol: number) => void;
  drawLine: (lineType: "h" | "v", row: number, col: number) => void;
  restartGame: () => void;
  sendSignal: (msg: object) => void;
  sendChat: (text: string) => void;
  sendTyping: () => void;
  openStory: (storyId: string) => void;
  storyTurnPage: (storyId: string, page: number) => void;
  storyHighlight: (storyId: string, page: number, sentenceIndex: number | null) => void;
  returnToLobby: () => void;
  returnToLobbyTrigger: number;
  navSyncTrigger: { screen: string; gameType?: string; storyId?: string } | null;
  sendNavSync: (screen: string, gameType?: string, storyId?: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameSocket(): UseGameSocketReturn {
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameType, setGameType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [incomingSignal, setIncomingSignal] = useState<object | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [storyState, setStoryState] = useState<StoryState | null>(null);
  const [returnToLobbyTrigger, setReturnToLobbyTrigger] = useState(0);
  const [navSyncTrigger, setNavSyncTrigger] = useState<{ screen: string; gameType?: string; storyId?: string } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL ||
      (typeof window !== "undefined" ? `ws://${window.location.hostname}:8000/ws` : "ws://localhost:8000/ws");
    const socket = new WebSocket(backendUrl);
    wsRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "room_created":
          setRoomCode(msg.room_code);
          setPlayerId(msg.player_id);
          setPlayerCount(1);
          break;

        case "room_joined":
          setRoomCode(msg.room_code);
          setPlayerId(msg.player_id);
          setPlayerCount(2);
          break;

        case "player_joined":
          setPlayerCount(msg.players);
          break;

        case "player_left":
          setPlayerCount(1);
          break;

        case "game_started":
          setGameType(msg.game_type);
          setGameState(msg.game_state);
          break;

        case "game_state": {
          const gs: GameState = msg.game_state;
          setGameState(gs);

          // Memory game: schedule flip-back for non-matched pair
          if (gs.type === "memory") {
            const mem = gs as MemoryGameState;
            if (mem.flipped_indices.length === 2) {
              const [i1, i2] = mem.flipped_indices;
              if (!mem.cards[i1].matched && !mem.cards[i2].matched) {
                if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
                resetTimerRef.current = setTimeout(() => {
                  send({ type: "reset_unmatched" });
                }, 1200);
              }
            }
          }
          break;
        }

        case "error":
          setError(msg.message);
          setTimeout(() => setError(null), 3000);
          break;

        // WebRTC signaling — pass to VideoCall component
        case "webrtc_offer":
        case "webrtc_answer":
        case "webrtc_ice":
          setIncomingSignal({ ...msg, _ts: Date.now() });
          break;

        case "chat_message": {
          const now = new Date();
          const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
          setChatMessages((prev) => [...prev, { player_id: msg.player_id, text: msg.text, time }]);
          break;
        }

        case "typing": {
          setTypingIndicator(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setTypingIndicator(false), 2000);
          break;
        }

        case "story_state":
          setStoryState({
            storyId: msg.story_id ?? null,
            page: msg.page ?? 0,
            highlight: msg.highlight ?? null,
          });
          break;

        case "return_to_lobby":
          setGameState(null);
          setGameType(null);
          setReturnToLobbyTrigger((t) => t + 1);
          break;

        case "nav_sync":
          setNavSyncTrigger({ screen: msg.screen, gameType: msg.game_type, storyId: msg.story_id });
          break;
      }
    };

    return () => {
      socket.close();
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [send]);

  return {
    connected,
    roomCode,
    playerId,
    playerCount,
    gameState,
    gameType,
    error,
    incomingSignal,
    chatMessages,
    typingIndicator,
    storyState,
    createRoom: () => send({ type: "create_room" }),
    joinRoom: (code: string) => send({ type: "join_room", room_code: code }),
    startGame: (type: string) => send({ type: "start_game", game_type: type }),
    flipCard: (index: number) => send({ type: "flip_card", index }),
    dropPiece: (col: number) => send({ type: "drop_piece", col }),
    rollDice: () => send({ type: "roll_dice" }),
    selectPiece: (row: number, col: number) => send({ type: "select_piece", row, col }),
    movePiece: (toRow: number, toCol: number) => send({ type: "move_piece", to_row: toRow, to_col: toCol }),
    drawLine: (lineType: "h" | "v", row: number, col: number) => send({ type: "draw_line", line_type: lineType, row, col }),
    restartGame: () => send({ type: "restart_game" }),
    sendSignal: (msg: object) => send(msg),
    sendChat: (text: string) => send({ type: "chat_message", text }),
    sendTyping: () => send({ type: "typing" }),
    openStory: (storyId: string) => send({ type: "open_story", story_id: storyId }),
    storyTurnPage: (storyId: string, page: number) => send({ type: "story_turn_page", story_id: storyId, page }),
    storyHighlight: (storyId: string, page: number, sentenceIndex: number | null) =>
      send({ type: "story_highlight", story_id: storyId, page, sentence_index: sentenceIndex }),
    returnToLobby: () => send({ type: "return_to_lobby" }),
    returnToLobbyTrigger,
    navSyncTrigger,
    sendNavSync: (screen: string, gameType?: string, storyId?: string) => send({ type: "nav_sync", screen, game_type: gameType, story_id: storyId }),
  };
}
