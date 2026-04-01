"use client";
import { useState } from "react";
import { STORIES, type Story } from "@/lib/stories";

interface StoryLibraryProps {
  onSelectStory: (story: Story) => void;
  onClose: () => void;
}

type AgeFilter = "all" | "1-2" | "5-6";

export default function StoryLibrary({ onSelectStory, onClose }: StoryLibraryProps) {
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");

  const filtered = STORIES.filter(
    (s) => ageFilter === "all" || s.ageGroup === ageFilter
  );

  return (
    <div
      className="flex flex-col min-h-screen max-w-2xl mx-auto w-full"
      style={{ background: "linear-gradient(180deg, #fffbf0 0%, #fef3d0 100%)" }}
    >
        {/* Header */}
        <div
          className="px-5 pt-6 pb-4 shrink-0 border-b border-amber-100"
          style={{ background: "linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold transition px-2 py-1 rounded-xl hover:bg-white/10"
              aria-label="סגור"
            >
              ✕
            </button>
            <div className="text-center flex-1" dir="rtl">
              <div className="text-4xl mb-1">📚</div>
              <h2 className="text-2xl font-extrabold text-white">ספריית הסיפורים</h2>
              <p className="text-purple-200 text-sm mt-0.5">בחרו סיפור לקרוא יחד</p>
            </div>
            <div className="w-12" />
          </div>

          {/* Age filter tabs */}
          <div className="flex gap-2 mt-3" dir="rtl">
            {(
              [
                { key: "all", label: "📖 הכל", count: STORIES.length },
                { key: "1-2", label: "👶 גיל 1-2", count: STORIES.filter(s => s.ageGroup === "1-2").length },
                { key: "5-6", label: "🧒 גיל 5-6", count: STORIES.filter(s => s.ageGroup === "5-6").length },
              ] as { key: AgeFilter; label: string; count: number }[]
            ).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setAgeFilter(key)}
                className={`flex-1 py-2.5 px-2 rounded-2xl font-bold text-sm transition border-2 ${
                  ageFilter === key
                    ? "bg-white text-purple-700 border-white shadow-md"
                    : "bg-purple-700/40 text-white border-transparent hover:bg-purple-700/60"
                }`}
              >
                {label}
                <span className="text-xs opacity-70 mr-1">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Story grid */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {(["1-2", "5-6"] as const).map((age) => {
            const group = filtered.filter((s) => s.ageGroup === age);
            if (group.length === 0) return null;
            return (
              <div key={age} className="mb-8">
                <div className="flex items-center gap-2 mb-4" dir="rtl">
                  <span className="text-2xl">{age === "1-2" ? "👶" : "🧒"}</span>
                  <h3 className="text-lg font-extrabold text-gray-700">
                    סיפורים לגיל {age}
                  </h3>
                  <div className="flex-1 h-0.5 bg-amber-200 mr-1" />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {group.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onSelect={() => onSelectStory(story)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="text-center text-xs text-gray-400 py-3 border-t border-amber-100 shrink-0 bg-white/80"
          dir="rtl"
        >
          ✨ לחיצה על סיפור תפתח אותו לשניכם בו-זמנית
        </div>
    </div>
  );
}

function StoryCard({ story, onSelect }: { story: Story; onSelect: () => void }) {
  const firstPage = story.pages[0];
  const ageBg = story.ageGroup === "1-2"
    ? { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" }
    : { bg: "#EDE9FE", text: "#5B21B6", border: "#A78BFA" };

  return (
    <button
      onClick={onSelect}
      className="group flex flex-col items-center text-center bg-white rounded-3xl shadow-md hover:shadow-2xl active:scale-95 transition-all duration-200 border-2 hover:border-purple-300 overflow-hidden"
      style={{ borderColor: "transparent" }}
    >
      {/* Gradient preview strip */}
      <div
        className="w-full relative overflow-hidden"
        style={{ height: 56, background: firstPage?.bgGradient ?? "linear-gradient(135deg,#fde68a,#fca5a5)" }}
      >
        {/* Mini scene hint */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: "2rem", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }}>
            {story.emoji}
          </span>
        </div>
      </div>

      <div className="p-3 w-full">
        {/* Age badge */}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2 border"
          style={{ background: ageBg.bg, color: ageBg.text, borderColor: ageBg.border }}
        >
          גיל {story.ageGroup}
        </span>

        {/* Title */}
        <h4 className="font-extrabold text-gray-800 text-sm leading-tight mb-1" dir="rtl">
          {story.title}
        </h4>

        {/* First line preview */}
        <p className="text-gray-400 text-xs leading-snug line-clamp-2 mb-2" dir="rtl">
          {firstPage?.text.slice(0, 55)}...
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-purple-400 font-semibold">{story.pages.length} עמ&apos;</span>
          <span className="text-gray-300">·</span>
          <span className="text-amber-400 font-semibold">{story.emoji}</span>
        </div>
      </div>
    </button>
  );
}
