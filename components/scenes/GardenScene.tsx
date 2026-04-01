"use client";

export default function GardenScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B8E0F7 60%, #7BC67E 100%)" }}>
      {/* Bright sun */}
      <div className="absolute animate-twinkle" style={{ top: 12, right: 30, "--duration": "4s" } as React.CSSProperties}>
        <div style={{ width: 48, height: 48, background: "#FFD700", borderRadius: "50%", boxShadow: "0 0 18px 10px rgba(255,215,0,0.45)" }} />
      </div>

      {/* Light clouds */}
      <div className="animate-drift absolute top-10 opacity-70" style={{ "--duration": "30s" } as React.CSSProperties}>
        <div className="w-24 h-10 bg-white rounded-full relative">
          <div className="absolute -top-3 left-4 w-14 h-10 bg-white rounded-full" />
        </div>
      </div>

      {/* Fence */}
      <div className="absolute" style={{ bottom: 50, left: 0, right: 0, height: 40 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ position: "absolute", bottom: 0, left: `${i * 5.5}%`, width: 10, height: 35, background: "#D2B48C", borderRadius: "2px 2px 0 0" }}>
            <div style={{ position: "absolute", top: -5, left: 0, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "8px solid #C4A882" }} />
          </div>
        ))}
        {/* Horizontal rails */}
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, height: 5, background: "#C4A882" }} />
        <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, height: 5, background: "#C4A882" }} />
      </div>

      {/* Rose bushes */}
      {[8, 25, 45, 62, 78, 92].map((x, i) => (
        <div key={i} className="absolute" style={{ left: `${x}%`, bottom: 50 }}>
          {/* Bush foliage */}
          <div style={{ width: 30, height: 24, background: "#2E7D32", borderRadius: "50%", position: "relative" }}>
            {/* Flowers */}
            {[0, 1, 2].map(j => (
              <div key={j} className="animate-sway absolute" style={{ top: -6 + j * 4, left: 2 + j * 8, animationDelay: `${(i + j) * 0.3}s`, transformOrigin: "bottom" }}>
                <div style={{ width: 12, height: 12, background: ["#E91E63", "#F44336", "#FF9800", "#9C27B0", "#FF69B4", "#FF4500"][i % 6], borderRadius: "50%", boxShadow: "0 0 4px rgba(255,100,100,0.4)" }} />
              </div>
            ))}
          </div>
          {/* Stem */}
          <div style={{ width: 4, height: 12, background: "#388E3C", margin: "0 auto" }} />
        </div>
      ))}

      {/* Butterflies */}
      <div className="animate-butterfly absolute" style={{ top: "25%" }}>
        <div style={{ position: "relative", width: 22, height: 14 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 10, height: 12, background: "#FFD700", borderRadius: "50% 50% 0 50%", opacity: 0.85 }} />
          <div style={{ position: "absolute", right: 0, top: 0, width: 10, height: 12, background: "#FFD700", borderRadius: "50% 50% 50% 0", opacity: 0.85 }} />
        </div>
      </div>

      {/* Grass */}
      <div className="absolute bottom-0 w-full h-12" style={{ background: "linear-gradient(0deg, #388E3C 0%, #66BB6A 100%)" }} />
      {[5, 18, 30, 48, 60, 75, 88].map((x, i) => (
        <div key={i} className="animate-sway absolute bottom-10" style={{ left: `${x}%`, animationDelay: `${i * 0.25}s` }}>
          <div style={{ width: 3, height: 16, background: "#4CAF50", borderRadius: 2, transformOrigin: "bottom" }} />
        </div>
      ))}
    </div>
  );
}
