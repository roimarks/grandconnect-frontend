"use client";

interface CharacterDisplayProps {
  character: string;
  characterExtra?: string;
}

export default function CharacterDisplay({ character, characterExtra }: CharacterDisplayProps) {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none" style={{ zIndex: 5 }}>
      {/* Main character */}
      <div className="animate-float relative">
        <span
          style={{
            fontSize: "5rem",
            lineHeight: 1,
            filter: "drop-shadow(0 20px 15px rgba(0,0,0,0.3))",
            display: "block",
          }}
        >
          {character}
        </span>
        {/* Shadow beneath */}
        <div style={{
          width: "60%",
          height: 8,
          background: "rgba(0,0,0,0.18)",
          borderRadius: "50%",
          margin: "0 auto",
          filter: "blur(4px)",
        }} />
      </div>

      {/* Secondary character — offset to right */}
      {characterExtra && (
        <div
          className="animate-float absolute"
          style={{
            right: "12%",
            bottom: "18%",
            animationDelay: "1.2s",
          }}
        >
          <span style={{ fontSize: "2.8rem", filter: "drop-shadow(0 8px 6px rgba(0,0,0,0.2))" }}>
            {characterExtra}
          </span>
        </div>
      )}
    </div>
  );
}
