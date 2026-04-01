"use client";

export default function RoadScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B0E0FF 50%, #90C060 100%)" }}>
      {/* Clouds */}
      <div className="animate-drift absolute top-8 opacity-80" style={{ "--duration": "28s" } as React.CSSProperties}>
        <div className="w-20 h-8 bg-white rounded-full relative">
          <div className="absolute -top-3 left-3 w-12 h-8 bg-white rounded-full" />
        </div>
      </div>
      <div className="animate-drift absolute top-14 opacity-60" style={{ "--duration": "40s", left: "50%" } as React.CSSProperties}>
        <div className="w-16 h-7 bg-white rounded-full relative">
          <div className="absolute -top-2 left-2 w-10 h-7 bg-white rounded-full" />
        </div>
      </div>

      {/* Sky horizon gradient */}
      <div className="absolute" style={{ bottom: 80, left: 0, right: 0, height: 60, background: "linear-gradient(180deg, transparent 0%, rgba(150,200,100,0.4) 100%)" }} />

      {/* Road (perspective) */}
      <div className="absolute bottom-12" style={{ left: 0, right: 0 }}>
        <svg viewBox="0 0 400 100" width="100%" height="100" preserveAspectRatio="none">
          {/* Road surface */}
          <path d="M150,0 L250,0 L400,100 L0,100 Z" fill="#888" />
          {/* Road markings */}
          <path d="M185,0 L195,0 L230,100 L215,100 Z" fill="#FFF" opacity="0.6" />
          <path d="M205,0 L215,0 L260,100 L245,100 Z" fill="#FFF" opacity="0.4" />
        </svg>
      </div>

      {/* Trees along road sides */}
      {[5, 18, 33].map((x, i) => (
        <div key={i} className="absolute bottom-28" style={{ left: `${x}%` }}>
          <div style={{ width: 0, height: 0, borderLeft: `${15 + i * 5}px solid transparent`, borderRight: `${15 + i * 5}px solid transparent`, borderBottom: `${40 + i * 15}px solid #2d7a1e` }} />
          <div style={{ width: 7, height: 20, background: "#6b3a1f", margin: "0 auto" }} />
        </div>
      ))}
      {[75, 85, 95].map((x, i) => (
        <div key={i} className="absolute bottom-28" style={{ left: `${x}%` }}>
          <div style={{ width: 0, height: 0, borderLeft: `${15 + i * 5}px solid transparent`, borderRight: `${15 + i * 5}px solid transparent`, borderBottom: `${40 + i * 15}px solid #2d7a1e` }} />
          <div style={{ width: 7, height: 20, background: "#6b3a1f", margin: "0 auto" }} />
        </div>
      ))}

      {/* Flowers by roadside */}
      {[2, 42, 55, 97].map((x, i) => (
        <div key={i} className="absolute" style={{ left: `${x}%`, bottom: 55 }}>
          <div className="animate-sway" style={{ animationDelay: `${i * 0.5}s`, transformOrigin: "bottom" }}>
            <div style={{ width: 3, height: 16, background: "#388E3C", margin: "0 auto" }} />
            <div style={{ width: 14, height: 14, background: i % 2 === 0 ? "#FF69B4" : "#FFD700", borderRadius: "50%", marginLeft: -5 }} />
          </div>
        </div>
      ))}

      {/* Horizon distant hills */}
      <svg className="absolute" style={{ bottom: 60, left: 0 }} viewBox="0 0 400 40" width="100%" height="40" preserveAspectRatio="none">
        <path d="M0,40 Q100,5 200,25 Q300,0 400,20 L400,40 Z" fill="rgba(100,160,70,0.5)" />
      </svg>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-12" style={{ background: "linear-gradient(0deg, #4a8a30 0%, #65a840 100%)" }} />
    </div>
  );
}
