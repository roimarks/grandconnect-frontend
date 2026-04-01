"use client";

export default function CastleScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #1a1040 0%, #4a2070 40%, #8B4513 100%)" }}>
      {/* Stars */}
      {[5, 15, 28, 40, 55, 68, 80, 92].map((x, i) => (
        <div key={i} className="animate-twinkle absolute" style={{ left: `${x}%`, top: `${5 + (i % 4) * 8}%`, "--duration": `${1.5 + i * 0.3}s` } as React.CSSProperties}>
          <div style={{ width: i % 3 === 0 ? 4 : 2, height: i % 3 === 0 ? 4 : 2, background: "#fffde7", borderRadius: "50%", boxShadow: "0 0 3px 1px rgba(255,253,200,0.7)" }} />
        </div>
      ))}

      {/* Moon */}
      <div className="absolute" style={{ top: 12, right: 20 }}>
        <div style={{ width: 45, height: 45, background: "#FFF9C4", borderRadius: "50%", boxShadow: "0 0 20px 8px rgba(255,249,150,0.35)" }} />
      </div>

      {/* Castle */}
      <div className="absolute" style={{ bottom: 30, left: "50%", transform: "translateX(-50%)", width: 260 }}>
        {/* Left tower */}
        <div className="absolute" style={{ left: 0, bottom: 0, width: 55, height: 110, background: "#4a4a6a" }}>
          {/* Crenellations */}
          {[0, 14, 28].map(x => <div key={x} style={{ position: "absolute", top: -12, left: x + 3, width: 10, height: 12, background: "#4a4a6a" }} />)}
          {/* Window */}
          <div style={{ position: "absolute", top: 25, left: 15, width: 22, height: 30, background: "#FFD700", borderRadius: "11px 11px 0 0", boxShadow: "0 0 10px 5px rgba(255,215,0,0.3)" }} />
          {/* Flag */}
          <div className="animate-flag absolute" style={{ top: -28, left: 24, transformOrigin: "left center" }}>
            <div style={{ width: 2, height: 20, background: "#888" }} />
            <div style={{ position: "absolute", top: 0, left: 2, width: 18, height: 12, background: "#E74C3C", clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
          </div>
        </div>

        {/* Right tower */}
        <div className="absolute" style={{ right: 0, bottom: 0, width: 55, height: 110, background: "#4a4a6a" }}>
          {[0, 14, 28].map(x => <div key={x} style={{ position: "absolute", top: -12, left: x + 3, width: 10, height: 12, background: "#4a4a6a" }} />)}
          <div style={{ position: "absolute", top: 25, left: 15, width: 22, height: 30, background: "#FFD700", borderRadius: "11px 11px 0 0", boxShadow: "0 0 10px 5px rgba(255,215,0,0.3)" }} />
          <div className="animate-flag absolute" style={{ top: -28, left: 24, transformOrigin: "left center", animationDelay: "0.5s" }}>
            <div style={{ width: 2, height: 20, background: "#888" }} />
            <div style={{ position: "absolute", top: 0, left: 2, width: 18, height: 12, background: "#3498DB", clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
          </div>
        </div>

        {/* Main wall */}
        <div style={{ position: "absolute", bottom: 0, left: 40, right: 40, height: 80, background: "#3d3d5c" }}>
          {/* Wall crenellations */}
          {[0, 18, 36, 54, 72].map(x => <div key={x} style={{ position: "absolute", top: -10, left: x + 5, width: 12, height: 10, background: "#3d3d5c" }} />)}
          {/* Gate arch */}
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 40, height: 55, background: "#1a1a2e", borderRadius: "20px 20px 0 0" }}>
            <div style={{ position: "absolute", top: 8, left: 4, right: 4, height: 3, background: "#555", opacity: 0.6 }} />
            <div style={{ position: "absolute", top: 14, left: 4, right: 4, height: 3, background: "#555", opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* Ground / moat */}
      <div className="absolute bottom-0 w-full h-8" style={{ background: "#3d2010" }} />
      {/* Water ripples */}
      <div className="animate-ripple absolute" style={{ bottom: 4, left: "25%", width: "50%", height: 3, background: "rgba(100,150,255,0.5)", borderRadius: 2 }} />
      <div className="animate-ripple absolute" style={{ bottom: 10, left: "30%", width: "40%", height: 2, background: "rgba(100,150,255,0.4)", borderRadius: 2, animationDelay: "1.5s" }} />
    </div>
  );
}
