"use client";

export default function MeadowScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B0E0FF 50%, #90EE90 100%)" }}>
      {/* Sun */}
      <div className="absolute animate-twinkle" style={{ top: 15, left: 60, "--duration": "4s" } as React.CSSProperties}>
        <div style={{ width: 50, height: 50, background: "#FFD700", borderRadius: "50%", boxShadow: "0 0 20px 10px rgba(255,215,0,0.5)", position: "relative" }}>
          {/* Rays */}
          <div className="animate-sun absolute inset-0" style={{ transformOrigin: "25px 25px" }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <div key={i} style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: 3, height: 14,
                background: "#FFD700",
                transformOrigin: "50% 0",
                transform: `rotate(${angle}deg) translateY(-32px)`,
                marginLeft: -1.5, marginTop: -7,
                borderRadius: 2,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Clouds */}
      <div className="animate-drift absolute top-8 opacity-90" style={{ "--duration": "30s", left: "30%" } as React.CSSProperties}>
        <div className="w-28 h-12 bg-white rounded-full relative">
          <div className="absolute -top-4 left-5 w-16 h-12 bg-white rounded-full" />
          <div className="absolute -top-2 left-14 w-12 h-9 bg-white rounded-full" />
        </div>
      </div>

      {/* Rolling hills */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 400 120" width="100%" height="120" preserveAspectRatio="none">
          <path d="M0,120 Q100,40 200,80 Q300,20 400,70 L400,120 Z" fill="#4CAF50" />
          <path d="M0,120 Q80,70 160,90 Q240,55 320,85 Q370,65 400,75 L400,120 Z" fill="#66BB6A" />
          <path d="M0,120 Q60,90 130,105 Q200,80 280,100 Q340,85 400,95 L400,120 Z" fill="#81C784" />
        </svg>
      </div>

      {/* Flowers */}
      {[10, 22, 38, 52, 65, 78, 90].map((x, i) => (
        <div key={i} className="absolute" style={{ left: `${x}%`, bottom: 30 + (i % 3) * 15 }}>
          <div className="animate-sway" style={{ animationDelay: `${i * 0.35}s`, transformOrigin: "bottom" }}>
            <div style={{ width: 3, height: 20, background: "#388E3C", margin: "0 auto", borderRadius: 2 }} />
            <div style={{ position: "relative", width: 20, height: 20, marginTop: -12, marginLeft: -9 }}>
              {[0, 72, 144, 216, 288].map((angle, j) => (
                <div key={j} style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: ["#FF69B4", "#FF6347", "#FFD700", "#9370DB", "#FF4500"][i % 5],
                  transform: `rotate(${angle}deg) translateX(6px) translateY(-4px)`,
                }} />
              ))}
              <div style={{ position: "absolute", top: 5, left: 5, width: 10, height: 10, background: "#FFD700", borderRadius: "50%", zIndex: 1 }} />
            </div>
          </div>
        </div>
      ))}

      {/* Butterflies */}
      <div className="animate-butterfly absolute" style={{ top: "30%" }}>
        <div style={{ position: "relative", width: 24, height: 16 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 10, height: 14, background: "#FF69B4", borderRadius: "50% 50% 0 50%", opacity: 0.8 }} />
          <div style={{ position: "absolute", right: 0, top: 0, width: 10, height: 14, background: "#FF69B4", borderRadius: "50% 50% 50% 0", opacity: 0.8 }} />
          <div style={{ position: "absolute", left: 8, top: 2, width: 8, height: 10, background: "#C2185B", borderRadius: "50% 50% 0 50%", opacity: 0.7 }} />
          <div style={{ position: "absolute", right: 6, top: 2, width: 8, height: 10, background: "#C2185B", borderRadius: "50% 50% 50% 0", opacity: 0.7 }} />
        </div>
      </div>
    </div>
  );
}
