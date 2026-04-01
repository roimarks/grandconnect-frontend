"use client";

const RAINDROPS = Array.from({ length: 30 }, (_, i) => ({
  x: (i * 3.5) % 100,
  delay: `${(i * 0.12) % 1.5}s`,
  dur: `${0.6 + (i % 5) * 0.15}s`,
}));

export default function StormScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #2c2c3e 0%, #3d3d52 40%, #4a3020 100%)" }}>
      {/* Lightning flash overlay */}
      <div className="animate-lightning absolute inset-0" style={{ background: "rgba(200,230,255,0.9)", zIndex: 10 }} />

      {/* Storm clouds */}
      {[0, 25, 55, 80].map((x, i) => (
        <div key={i} className="animate-storm-cloud absolute" style={{ left: `${x}%`, top: 5 + (i % 2) * 12, animationDelay: `${i * 0.7}s` }}>
          <div style={{ width: 100 + (i % 2) * 40, height: 45, background: `hsl(220,15%,${20 + i * 5}%)`, borderRadius: 30, position: "relative" }}>
            <div style={{ position: "absolute", top: -14, left: 10, width: 60, height: 35, background: `hsl(220,15%,${18 + i * 5}%)`, borderRadius: 30 }} />
            <div style={{ position: "absolute", top: -8, left: 40, width: 45, height: 28, background: `hsl(220,15%,${22 + i * 4}%)`, borderRadius: 30 }} />
          </div>
        </div>
      ))}

      {/* Rain */}
      {RAINDROPS.map((drop, i) => (
        <div
          key={i}
          className="animate-rain absolute"
          style={{
            left: `${drop.x}%`,
            top: "-30px",
            "--duration": drop.dur,
            animationDelay: drop.delay,
          } as React.CSSProperties}
        >
          <div style={{
            width: 2,
            height: 14,
            background: "rgba(180,210,255,0.7)",
            borderRadius: 1,
            transform: "rotate(15deg)",
          }} />
        </div>
      ))}

      {/* Lightning bolt SVG */}
      <div className="animate-twinkle absolute" style={{ top: "15%", left: "40%", "--duration": "4s", animationDelay: "2s" } as React.CSSProperties}>
        <svg width="30" height="60" viewBox="0 0 30 60">
          <path d="M20,0 L8,28 L16,28 L6,60 L24,24 L15,24 Z" fill="#FFE066" style={{ filter: "drop-shadow(0 0 6px #FFD700)" }} />
        </svg>
      </div>
      <div className="animate-twinkle absolute" style={{ top: "10%", left: "70%", "--duration": "6s", animationDelay: "0.5s" } as React.CSSProperties}>
        <svg width="20" height="45" viewBox="0 0 20 45">
          <path d="M14,0 L5,20 L11,20 L3,45 L17,18 L10,18 Z" fill="#FFE066" style={{ filter: "drop-shadow(0 0 4px #FFD700)" }} />
        </svg>
      </div>

      {/* Dark wet ground */}
      <div className="absolute bottom-0 w-full h-14" style={{ background: "#1a1208" }}>
        {/* Puddles */}
        {[15, 40, 65, 85].map((x, i) => (
          <div key={i} className="animate-ripple absolute bottom-3" style={{ left: `${x}%`, width: 30 + (i % 3) * 15, height: 6, background: "rgba(150,180,220,0.5)", borderRadius: "50%", animationDelay: `${i * 0.8}s` }} />
        ))}
      </div>
    </div>
  );
}
