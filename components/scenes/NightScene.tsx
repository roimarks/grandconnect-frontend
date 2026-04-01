"use client";

const STARS = [
  { x: 8, y: 10, d: "1.8s" }, { x: 18, y: 5, d: "2.3s" }, { x: 30, y: 15, d: "1.5s" },
  { x: 42, y: 8, d: "2.8s" }, { x: 55, y: 4, d: "1.2s" }, { x: 65, y: 18, d: "3.1s" },
  { x: 75, y: 7, d: "2.0s" }, { x: 88, y: 12, d: "1.7s" }, { x: 95, y: 20, d: "2.5s" },
  { x: 12, y: 25, d: "3.3s" }, { x: 25, y: 30, d: "1.9s" }, { x: 38, y: 22, d: "2.2s" },
  { x: 50, y: 28, d: "1.4s" }, { x: 62, y: 35, d: "2.7s" }, { x: 78, y: 25, d: "1.6s" },
  { x: 92, y: 33, d: "3.0s" }, { x: 5, y: 40, d: "2.1s" }, { x: 20, y: 42, d: "1.3s" },
  { x: 35, y: 45, d: "2.9s" }, { x: 48, y: 38, d: "1.8s" }, { x: 72, y: 40, d: "2.4s" },
  { x: 85, y: 48, d: "1.1s" },
];

export default function NightScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #0d0d2b 0%, #1a1040 40%, #2d1b6e 70%, #1a0a3d 100%)" }}>
      {/* Shooting star */}
      <div className="animate-shoot-star absolute" style={{ top: "5%", left: "0%", animationDuration: "8s" }}>
        <div style={{ width: 80, height: 2, background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,200,0.9) 100%)", borderRadius: 2 }} />
      </div>

      {/* Stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="animate-twinkle absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, "--duration": s.d } as React.CSSProperties}
        >
          <div style={{ width: i % 4 === 0 ? 4 : 2, height: i % 4 === 0 ? 4 : 2, background: "#fffde7", borderRadius: "50%", boxShadow: "0 0 4px 2px rgba(255,253,200,0.6)" }} />
        </div>
      ))}

      {/* Moon */}
      <div className="absolute" style={{ top: "8%", right: "12%" }}>
        <div style={{ width: 60, height: 60, background: "#fff9c4", borderRadius: "50%", boxShadow: "0 0 30px 15px rgba(255,249,150,0.4), 0 0 60px 30px rgba(255,249,100,0.15)" }}>
          {/* Moon craters */}
          <div style={{ position: "absolute", top: 12, left: 10, width: 10, height: 10, background: "rgba(200,180,0,0.3)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: 30, left: 35, width: 7, height: 7, background: "rgba(200,180,0,0.25)", borderRadius: "50%" }} />
        </div>
      </div>

      {/* Silhouette landscape */}
      <div className="absolute bottom-0 w-full">
        {/* Hills */}
        <svg viewBox="0 0 400 80" width="100%" height="80" preserveAspectRatio="none">
          <path d="M0,80 Q50,20 120,50 Q180,10 250,45 Q310,15 380,40 L400,80 Z" fill="#0a0a1a" />
          <path d="M0,80 Q30,40 80,55 Q130,30 190,58 Q240,35 300,55 Q350,38 400,50 L400,80 Z" fill="#050510" />
        </svg>
        {/* Tree silhouettes */}
        {[8, 22, 68, 80, 92].map((x, i) => (
          <div key={i} className="absolute bottom-12" style={{ left: `${x}%` }}>
            <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderBottom: `${30 + (i % 2) * 15}px solid #050510` }} />
            <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: `${22 + (i % 2) * 10}px solid #050510`, marginTop: -18, marginLeft: 3 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
