"use client";

export default function RiverScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B0E0FF 50%, #90C060 100%)" }}>
      {/* Clouds */}
      <div className="animate-drift absolute top-6 opacity-80" style={{ "--duration": "26s" } as React.CSSProperties}>
        <div className="w-22 h-10 bg-white rounded-full relative" style={{ width: 88 }}>
          <div className="absolute -top-3 left-4 w-14 h-10 bg-white rounded-full" />
        </div>
      </div>

      {/* Trees on left bank */}
      {[2, 14, 28].map((x, i) => (
        <div key={i} className="absolute bottom-28" style={{ left: `${x}%` }}>
          <div style={{ width: 0, height: 0, borderLeft: `${18 + i * 6}px solid transparent`, borderRight: `${18 + i * 6}px solid transparent`, borderBottom: `${50 + i * 18}px solid #2d8a1e` }} />
          <div style={{ width: 7, height: 20, background: "#6b3a1f", margin: "0 auto" }} />
        </div>
      ))}

      {/* Trees on right bank */}
      {[72, 84, 95].map((x, i) => (
        <div key={i} className="absolute bottom-28" style={{ left: `${x}%` }}>
          <div style={{ width: 0, height: 0, borderLeft: `${18 + i * 5}px solid transparent`, borderRight: `${18 + i * 5}px solid transparent`, borderBottom: `${50 + i * 16}px solid #2d8a1e` }} />
          <div style={{ width: 7, height: 18, background: "#6b3a1f", margin: "0 auto" }} />
        </div>
      ))}

      {/* River */}
      <div className="absolute" style={{ bottom: 10, left: "28%", right: "28%", top: "45%" }}>
        <div style={{ height: "100%", background: "linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)", borderRadius: "0 0 10px 10px" }}>
          {/* Water ripples */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="animate-ripple absolute" style={{
              left: `${10 + i * 22}%`,
              top: `${20 + (i % 2) * 30}%`,
              width: "20%",
              height: 3,
              background: "rgba(255,255,255,0.5)",
              borderRadius: "50%",
              animationDelay: `${i * 0.75}s`,
            }} />
          ))}
          {/* Reflection sparkles */}
          {[15, 45, 70].map((x, i) => (
            <div key={i} className="animate-twinkle absolute" style={{ left: `${x}%`, top: "40%", "--duration": `${1 + i * 0.5}s` } as React.CSSProperties}>
              <div style={{ width: 4, height: 4, background: "rgba(255,255,255,0.8)", borderRadius: "50%" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Bridge */}
      <div className="absolute" style={{ bottom: "35%", left: "22%", right: "22%", height: 10, background: "#8B5E3C", borderRadius: 4, zIndex: 2 }}>
        {/* Bridge pillars */}
        <div style={{ position: "absolute", top: "100%", left: "25%", width: 12, height: 40, background: "#6B4226" }} />
        <div style={{ position: "absolute", top: "100%", right: "25%", width: 12, height: 40, background: "#6B4226" }} />
        {/* Bridge railings */}
        {[10, 25, 40, 55, 70, 85].map((x, i) => (
          <div key={i} style={{ position: "absolute", top: -12, left: `${x}%`, width: 3, height: 12, background: "#8B5E3C" }} />
        ))}
      </div>

      {/* Bank grass */}
      <div className="absolute bottom-0 w-full" style={{ left: 0, right: 0, height: 50 }}>
        <svg viewBox="0 0 400 50" width="100%" height="50" preserveAspectRatio="none">
          <path d="M0,50 L0,15 Q60,0 120,20 L120,50 Z" fill="#5a9a35" />
          <path d="M280,50 L280,18 Q340,2 400,15 L400,50 Z" fill="#5a9a35" />
          <rect x="0" y="35" width="120" height="15" fill="#4a8a28" />
          <rect x="280" y="35" width="120" height="15" fill="#4a8a28" />
        </svg>
      </div>
    </div>
  );
}
