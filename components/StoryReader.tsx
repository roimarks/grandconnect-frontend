"use client";
import { useState, useEffect, useRef } from "react";
import { type Story } from "@/lib/stories";
import type { StoryState } from "@/hooks/useGameSocket";
import SceneRenderer from "@/components/scenes/SceneRenderer";

interface StoryReaderProps {
  story: Story;
  storyState: StoryState | null;
  onTurnPage: (storyId: string, page: number) => void;
  onHighlight: (storyId: string, page: number, sentenceIndex: number | null) => void;
  onClose: () => void;
}

type FontSize = "sm" | "md" | "lg";

const FONT_SIZES: Record<FontSize, string> = {
  sm: "text-xl leading-loose",
  md: "text-2xl leading-loose",
  lg: "text-3xl leading-loose",
};

// Split text into individual sentences preserving punctuation
function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.filter((s) => s.trim().length > 0);
}

export default function StoryReader({
  story,
  storyState,
  onTurnPage,
  onHighlight,
  onClose,
}: StoryReaderProps) {
  const [fontSize, setFontSize] = useState<FontSize>("lg");
  const [displayPage, setDisplayPage] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [transDir, setTransDir] = useState<"forward" | "back">("forward");
  const prevPageRef = useRef(0);

  const remotePage = storyState?.storyId === story.id ? (storyState.page ?? 0) : 0;
  const remoteHighlight = storyState?.storyId === story.id ? (storyState.highlight ?? null) : null;

  // Sync page from remote storyState with transition
  useEffect(() => {
    if (remotePage !== prevPageRef.current) {
      const dir = remotePage > prevPageRef.current ? "forward" : "back";
      setTransDir(dir);
      setTransitioning(true);
      const t = setTimeout(() => {
        setDisplayPage(remotePage);
        prevPageRef.current = remotePage;
        setTransitioning(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [remotePage]);

  useEffect(() => {
    setDisplayPage(remotePage);
    prevPageRef.current = remotePage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = story.pages.length;
  const isOnCover = displayPage === 0;
  const currentPageData = displayPage > 0 && displayPage <= totalPages ? story.pages[displayPage - 1] : null;
  const sentences = currentPageData ? splitSentences(currentPageData.text) : [];

  const goToPage = (page: number) => {
    if (page < 0 || page > totalPages) return;
    onTurnPage(story.id, page);
  };

  const handleSentenceClick = (idx: number) => {
    if (!currentPageData) return;
    const newHighlight = remoteHighlight === idx ? null : idx;
    onHighlight(story.id, displayPage, newHighlight);
  };

  // Transition style
  const transitionStyle: React.CSSProperties = transitioning
    ? {
        transform: transDir === "forward" ? "translateX(-60px) scale(0.96)" : "translateX(60px) scale(0.96)",
        opacity: 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
      }
    : {
        transform: "translateX(0) scale(1)",
        opacity: 1,
        transition: "transform 0.35s ease, opacity 0.35s ease",
      };

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "100vh", paddingTop: 160 }}
      dir="rtl"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-amber-100 sticky top-[160px] z-20 shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-700 font-bold transition px-3 py-1.5 rounded-xl hover:bg-purple-50"
          aria-label="חזור"
        >
          <span className="text-lg">→</span>
          <span className="text-sm hidden sm:inline">חזור</span>
        </button>

        <div className="text-center flex-1 mx-2">
          <div className="font-extrabold text-gray-700 text-lg leading-tight" dir="rtl">
            {story.emoji} {story.title}
          </div>
          {!isOnCover && (
            <div className="text-xs text-purple-400 font-medium mt-0.5">
              📖 קוראים יחד · עמוד {displayPage} מתוך {totalPages}
            </div>
          )}
        </div>

        {/* Font size controls */}
        <div className="flex gap-1">
          {(["sm", "md", "lg"] as FontSize[]).map((size, i) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`rounded-full w-9 h-9 font-black transition border-2 ${
                fontSize === size
                  ? "bg-purple-600 text-white border-purple-600 shadow"
                  : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"
              }`}
              style={{ fontSize: 10 + i * 3 }}
              aria-label={`גופן ${i + 1}`}
            >
              א
            </button>
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-2 bg-amber-100">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
          style={{ width: `${(displayPage / totalPages) * 100}%` }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 px-3 pb-6 pt-3" style={transitionStyle}>
        {isOnCover ? (
          /* ── Cover page ── */
          <div
            className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 rounded-3xl py-10 px-6"
            style={{ background: story.pages[0]?.bgGradient ?? "linear-gradient(135deg,#fdf6e3,#f8edd9)" }}
          >
            <div className="animate-float" style={{ filter: "drop-shadow(0 16px 20px rgba(0,0,0,0.2))" }}>
              <span style={{ fontSize: "9rem", lineHeight: 1 }}>{story.emoji}</span>
            </div>

            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3"
                style={{
                  background: story.ageGroup === "1-2" ? "#fde68a" : "#ddd6fe",
                  color: story.ageGroup === "1-2" ? "#92400e" : "#5b21b6",
                }}
              >
                גיל {story.ageGroup}
              </span>
              <h2 className="text-5xl font-extrabold text-gray-800 mb-3" style={{ fontFamily: "Georgia, serif" }} dir="rtl">
                {story.title}
              </h2>
              <p className="text-gray-500 text-lg max-w-xs mx-auto" dir="rtl">
                {story.description}
              </p>
            </div>

            <button
              onClick={() => goToPage(1)}
              className="mt-2 px-12 py-5 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 active:scale-95 text-white text-2xl font-black rounded-3xl shadow-2xl transition border-4 border-purple-300/40"
              dir="rtl"
            >
              🎉 נתחיל לקרוא!
            </button>
          </div>
        ) : currentPageData ? (
          /* ── Story page ── */
          <div className="flex flex-col gap-4">
            {/* Animated Scene */}
            <SceneRenderer
              scene={currentPageData.scene}
              character={currentPageData.character}
              characterExtra={currentPageData.characterExtra}
              bgGradient={currentPageData.bgGradient}
            />

            {/* Parchment reading area */}
            <div
              className="rounded-3xl px-5 py-5 mx-1"
              style={{
                background: "linear-gradient(135deg, #fdf6e3 0%, #f8edd9 100%)",
                border: "3px solid #d4a853",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.12)",
              }}
            >
              {/* "Reading together" badge */}
              <div className="flex justify-center mb-3">
                <span className="text-xs text-amber-700 font-bold bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  📖 קוראים יחד
                </span>
              </div>

              {/* Sentences */}
              <div className="space-y-1" dir="rtl">
                {sentences.map((sentence, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleSentenceClick(idx)}
                    className={`
                      cursor-pointer rounded-2xl px-3 py-1.5 inline-block leading-loose
                      transition-all duration-300
                      ${FONT_SIZES[fontSize]}
                      ${
                        remoteHighlight === idx
                          ? "bg-yellow-200 shadow-md scale-[1.02] border-2 border-yellow-400"
                          : "hover:bg-amber-50 border-2 border-transparent"
                      }
                    `}
                    style={{
                      fontFamily: "Georgia, serif",
                      animationDelay: `${idx * 80}ms`,
                    }}
                  >
                    {sentence}
                  </span>
                ))}
              </div>

              {remoteHighlight === null && (
                <p className="text-xs text-amber-400 mt-3 text-center" dir="rtl">
                  לחץ על משפט כדי להדגיש אותו לשניכם ✨
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Navigation footer ── */}
      <div
        className="sticky bottom-0 flex flex-col gap-2 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-amber-100 shadow-lg"
        style={{ zIndex: 20 }}
      >
        {/* Page dots */}
        <div className="flex gap-1.5 justify-center flex-wrap">
          {Array.from({ length: totalPages + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === displayPage ? 18 : 10,
                height: 10,
                background: i === displayPage ? "#9333ea" : "#e5e7eb",
              }}
              aria-label={`עמוד ${i}`}
            />
          ))}
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => goToPage(displayPage - 1)}
            disabled={displayPage <= 0}
            className="flex items-center gap-2 px-6 py-3 bg-purple-100 hover:bg-purple-200 active:scale-95 disabled:opacity-30 text-purple-700 font-black rounded-2xl transition shadow-sm"
            aria-label="עמוד קודם"
          >
            ← הקודם
          </button>

          <div className="text-center text-xs text-gray-400 font-medium">
            {isOnCover ? "שער הסיפור" : `${displayPage} / ${totalPages}`}
          </div>

          <button
            onClick={() => goToPage(displayPage + 1)}
            disabled={displayPage >= totalPages}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-30 text-white font-black rounded-2xl transition shadow-md"
            aria-label="עמוד הבא"
          >
            הבא →
          </button>
        </div>
      </div>
    </div>
  );
}
