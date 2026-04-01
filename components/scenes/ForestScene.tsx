"use client";

export default function ForestScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #b8e4b8 70%, #5a8a3c 100%)" }}>
      {/* Clouds */}
      <div className="animate-drift absolute top-6 opacity-80" style={{ "--duration": "22s" } as React.CSSProperties}>
        <div className="w-24 h-10 bg-white rounded-full relative">
          <div className="absolute -top-4 left-4 w-14 h-10 bg-white rounded-full" />
          <div className="absolute -top-2 left-10 w-10 h-8 bg-white rounded-full" />
        </div>
      </div>
      <div className="animate-drift absolute top-10 opacity-70" style={{ "--duration": "35s", left: "40%" } as React.CSSProperties}>
        <div className="w-16 h-8 bg-white rounded-full relative">
          <div className="absolute -top-3 left-2 w-10 h-8 bg-white rounded-full" />
        </div>
      </div>

      {/* Birds */}
      <div className="absolute" style={{ animation: "fly-bird 18s linear infinite", top: "18%" }}>
        <span style={{ fontSize: "18px" }}>🐦</span>
      </div>
      <div className="absolute" style={{ animation: "fly-bird 28s linear infinite 5s", top: "12%" }}>
        <span style={{ fontSize: "14px" }}>🐦</span>
      </div>

      {/* Back trees (darker) */}
      {[5, 18, 32, 55, 70, 85].map((x, i) => (
        <div key={i} className="absolute bottom-12" style={{ left: `${x}%` }}>
          <div style={{
            width: 0, height: 0,
            borderLeft: `${20 + (i % 3) * 8}px solid transparent`,
            borderRight: `${20 + (i % 3) * 8}px solid transparent`,
            borderBottom: `${55 + (i % 3) * 20}px solid #2d6a1e`,
          }} />
          <div style={{
            width: 0, height: 0,
            borderLeft: `${14 + (i % 3) * 5}px solid transparent`,
            borderRight: `${14 + (i % 3) * 5}px solid transparent`,
            borderBottom: `${40 + (i % 3) * 15}px solid #2d6a1e`,
            marginTop: -30, marginLeft: 6 + (i % 3) * 3,
          }} />
        </div>
      ))}

      {/* Front trees (brighter) */}
      {[0, 25, 50, 75, 95].map((x, i) => (
        <div key={i} className="absolute bottom-8" style={{ left: `${x}%` }}>
          <div style={{
            width: 0, height: 0,
            borderLeft: `${25 + (i % 2) * 10}px solid transparent`,
            borderRight: `${25 + (i % 2) * 10}px solid transparent`,
            borderBottom: `${70 + (i % 2) * 25}px solid #3a8a25`,
          }} />
          <div style={{
            width: 0, height: 0,
            borderLeft: `${18 + (i % 2) * 7}px solid transparent`,
            borderRight: `${18 + (i % 2) * 7}px solid transparent`,
            borderBottom: `${50 + (i % 2) * 18}px solid #3a8a25`,
            marginTop: -38, marginLeft: 7 + (i % 2) * 3,
          }} />
          {/* Trunk */}
          <div style={{ width: 8, height: 18, background: "#6b3a1f", marginLeft: 17 + (i % 2) * 5, marginTop: -2 }} />
        </div>
      ))}

      {/* Fireflies */}
      {[15, 40, 62, 80].map((x, i) => (
        <div key={i} className="animate-twinkle absolute"
          style={{ left: `${x}%`, bottom: `${25 + (i * 7)}%`, "--duration": `${1.5 + i * 0.4}s` } as React.CSSProperties}>
          <div className="w-2 h-2 bg-yellow-300 rounded-full" style={{ boxShadow: "0 0 6px 3px rgba(255,255,150,0.8)" }} />
        </div>
      ))}

      {/* Grass */}
      <div className="absolute bottom-0 w-full h-12" style={{ background: "linear-gradient(0deg, #3a7a20 0%, #5a9a35 100%)" }} />
      {[5, 15, 28, 42, 58, 72, 85, 95].map((x, i) => (
        <div key={i} className="animate-sway absolute bottom-8" style={{ left: `${x}%`, animationDelay: `${i * 0.3}s` }}>
          <div style={{ width: 4, height: 18, background: "#4a8a28", borderRadius: 2, transformOrigin: "bottom" }} />
        </div>
      ))}
    </div>
  );
}
