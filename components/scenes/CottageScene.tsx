"use client";

export default function CottageScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #b0d8f0 60%, #90C080 100%)" }}>
      {/* Sky clouds */}
      <div className="animate-drift absolute top-4 opacity-80" style={{ "--duration": "25s" } as React.CSSProperties}>
        <div className="w-20 h-9 bg-white rounded-full relative">
          <div className="absolute -top-3 left-3 w-12 h-9 bg-white rounded-full" />
          <div className="absolute -top-2 left-9 w-8 h-7 bg-white rounded-full" />
        </div>
      </div>

      {/* House body */}
      <div className="absolute" style={{ bottom: 40, left: "50%", transform: "translateX(-50%)" }}>
        {/* Roof */}
        <div style={{ width: 0, height: 0, borderLeft: "90px solid transparent", borderRight: "90px solid transparent", borderBottom: "70px solid #8B3A3A", marginLeft: 10 }} />
        {/* Chimney */}
        <div className="absolute" style={{ top: -15, right: 40, width: 18, height: 35, background: "#6b2d2d" }}>
          {/* Smoke */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="animate-smoke absolute"
              style={{
                bottom: "100%",
                left: 3 + i * 3,
                width: 10,
                height: 10,
                background: "rgba(180,180,180,0.6)",
                borderRadius: "50%",
                animationDelay: `${i * 0.8}s`,
                animationDuration: "2.5s",
              }}
            />
          ))}
        </div>
        {/* Walls */}
        <div style={{ width: 200, height: 110, background: "#F4E4C1", position: "relative" }}>
          {/* Door */}
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 40, height: 60, background: "#8B5E3C", borderRadius: "20px 20px 0 0" }}>
            <div style={{ position: "absolute", top: 28, right: 6, width: 7, height: 7, background: "#FFD700", borderRadius: "50%" }} />
          </div>
          {/* Left window */}
          <div className="animate-pulse-glow absolute" style={{ top: 20, left: 20, width: 40, height: 35, background: "#FFD700", borderRadius: 4, border: "3px solid #8B7355" }}>
            <div style={{ position: "absolute", top: 0, left: "50%", width: 2, height: "100%", background: "rgba(0,0,0,0.2)" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 2, background: "rgba(0,0,0,0.2)" }} />
          </div>
          {/* Right window */}
          <div className="animate-pulse-glow absolute" style={{ top: 20, right: 20, width: 40, height: 35, background: "#FFD700", borderRadius: 4, border: "3px solid #8B7355" }}>
            <div style={{ position: "absolute", top: 0, left: "50%", width: 2, height: "100%", background: "rgba(0,0,0,0.2)" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 2, background: "rgba(0,0,0,0.2)" }} />
          </div>
        </div>
      </div>

      {/* Garden flowers */}
      {[15, 30, 68, 82].map((x, i) => (
        <div key={i} className="absolute bottom-10" style={{ left: `${x}%` }}>
          <div className="animate-sway" style={{ animationDelay: `${i * 0.4}s`, transformOrigin: "bottom" }}>
            <div style={{ width: 3, height: 24, background: "#3a7a20", marginLeft: 7, borderRadius: 2 }} />
            <div style={{ width: 16, height: 16, background: i % 2 === 0 ? "#FF69B4" : "#FF6347", borderRadius: "50%", marginLeft: 0, marginTop: -8, boxShadow: "0 0 6px rgba(255,100,100,0.4)" }} />
          </div>
        </div>
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-12" style={{ background: "linear-gradient(0deg, #4a8a30 0%, #65a840 100%)" }} />
    </div>
  );
}
