"use client";

const SNOWFLAKES = [
  { x: 5, d: "3s", delay: "0s", size: 8 },
  { x: 15, d: "4.5s", delay: "0.5s", size: 6 },
  { x: 25, d: "3.8s", delay: "1s", size: 10 },
  { x: 35, d: "5s", delay: "0.2s", size: 7 },
  { x: 45, d: "3.2s", delay: "1.5s", size: 9 },
  { x: 55, d: "4.2s", delay: "0.8s", size: 6 },
  { x: 65, d: "3.6s", delay: "0.3s", size: 8 },
  { x: 75, d: "4.8s", delay: "1.2s", size: 7 },
  { x: 85, d: "3.4s", delay: "0.7s", size: 10 },
  { x: 92, d: "5.2s", delay: "0.1s", size: 6 },
  { x: 10, d: "4.1s", delay: "2s", size: 5 },
  { x: 40, d: "3.9s", delay: "1.8s", size: 8 },
  { x: 70, d: "4.4s", delay: "0.6s", size: 6 },
  { x: 88, d: "3.7s", delay: "1.4s", size: 9 },
];

export default function WinterScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #B0C4DE 0%, #D0E8F8 50%, #E8F4FD 100%)" }}>
      {/* Snowflakes */}
      {SNOWFLAKES.map((flake, i) => (
        <div
          key={i}
          className="animate-snowfall absolute"
          style={{
            left: `${flake.x}%`,
            top: "-20px",
            "--duration": flake.d,
            animationDelay: flake.delay,
          } as React.CSSProperties}
        >
          <div style={{
            width: flake.size,
            height: flake.size,
            background: "white",
            borderRadius: "50%",
            boxShadow: `0 0 ${flake.size / 2}px rgba(200,220,255,0.8)`,
          }} />
        </div>
      ))}

      {/* Pale sun behind clouds */}
      <div className="absolute animate-twinkle" style={{ top: 15, left: 70, "--duration": "5s" } as React.CSSProperties}>
        <div style={{ width: 45, height: 45, background: "rgba(255,255,200,0.6)", borderRadius: "50%", boxShadow: "0 0 25px 15px rgba(255,255,200,0.3)" }} />
      </div>

      {/* Heavy winter clouds */}
      {[0, 30, 65].map((x, i) => (
        <div key={i} className="animate-drift absolute top-6 opacity-90" style={{ left: `${x}%`, "--duration": `${20 + i * 8}s`, animationDelay: `${i * 5}s` } as React.CSSProperties}>
          <div style={{ width: 100, height: 40, background: "#C8D8E8", borderRadius: "50px" }}>
            <div style={{ position: "absolute", top: -12, left: 15, width: 55, height: 35, background: "#C8D8E8", borderRadius: "50px" }} />
            <div style={{ position: "absolute", top: -8, left: 50, width: 40, height: 28, background: "#C8D8E8", borderRadius: "50px" }} />
          </div>
        </div>
      ))}

      {/* Snow-covered ground */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 400 70" width="100%" height="70" preserveAspectRatio="none">
          <path d="M0,70 Q50,20 120,40 Q190,10 260,35 Q330,15 400,30 L400,70 Z" fill="white" />
          <path d="M0,70 Q40,35 100,50 Q170,25 240,48 Q310,28 400,42 L400,70 Z" fill="rgba(220,235,250,0.9)" />
        </svg>
      </div>

      {/* Bare trees */}
      {[8, 30, 55, 75, 92].map((x, i) => (
        <div key={i} className="absolute bottom-20" style={{ left: `${x}%` }}>
          <div style={{ width: 8, height: 80 + (i % 3) * 25, background: "#5D4037", position: "relative" }}>
            <div style={{ position: "absolute", top: 20, left: -18, width: 22, height: 4, background: "#5D4037", transform: "rotate(-40deg)" }} />
            <div style={{ position: "absolute", top: 35, right: -15, width: 18, height: 3, background: "#5D4037", transform: "rotate(35deg)" }} />
            <div style={{ position: "absolute", top: 50, left: -12, width: 15, height: 3, background: "#5D4037", transform: "rotate(-55deg)" }} />
            {/* Snow on branch */}
            <div style={{ position: "absolute", top: 18, left: -20, width: 20, height: 4, background: "white", transform: "rotate(-40deg)", borderRadius: 2, opacity: 0.9 }} />
          </div>
          {/* Snow at base */}
          <div style={{ width: 22, height: 8, background: "white", borderRadius: "0 0 10px 10px", marginLeft: -7 }} />
        </div>
      ))}
    </div>
  );
}
