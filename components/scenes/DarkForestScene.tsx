"use client";

const EYES = [
  { x: 8, y: 35 }, { x: 25, y: 50 }, { x: 45, y: 30 },
  { x: 65, y: 55 }, { x: 80, y: 38 }, { x: 92, y: 48 },
];

export default function DarkForestScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0d30 30%, #0d1a0a 70%, #050a05 100%)" }}>
      {/* Eerie sky gradient */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a0540 0%, #2d1060 20%, transparent 50%)" }} />

      {/* Dark gnarled trees */}
      {[0, 12, 25, 38, 52, 65, 78, 90].map((x, i) => (
        <div key={i} className="absolute bottom-12" style={{ left: `${x}%` }}>
          {/* Trunk */}
          <div style={{ width: 10 + (i % 3) * 5, height: 100 + (i % 3) * 40, background: "#1a0d05", position: "relative" }}>
            {/* Branch left */}
            <div style={{ position: "absolute", top: 30, left: -20, width: 25, height: 4, background: "#1a0d05", transform: "rotate(-30deg)" }} />
            {/* Branch right */}
            <div style={{ position: "absolute", top: 50, right: -20, width: 22, height: 4, background: "#1a0d05", transform: "rotate(25deg)" }} />
            {/* Sub-branch */}
            <div style={{ position: "absolute", top: 60, left: -12, width: 16, height: 3, background: "#1a0d05", transform: "rotate(-50deg)" }} />
          </div>
          {/* Tree top (dark spiky) */}
          <div style={{ width: 0, height: 0, borderLeft: `${20 + (i % 3) * 8}px solid transparent`, borderRight: `${20 + (i % 3) * 8}px solid transparent`, borderBottom: `${60 + (i % 3) * 20}px solid #0a0a0a`, marginTop: -50, marginLeft: -(7 + (i % 3) * 4) }} />
        </div>
      ))}

      {/* Glowing eyes in darkness */}
      {EYES.map((eye, i) => (
        <div key={i} className="animate-blink-eyes absolute" style={{ left: `${eye.x}%`, top: `${eye.y}%`, animationDelay: `${i * 0.7}s` }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 8, height: 8, background: "#00FF66", borderRadius: "50%", boxShadow: "0 0 8px 4px rgba(0,255,100,0.6)" }} />
            <div style={{ width: 8, height: 8, background: "#00FF66", borderRadius: "50%", boxShadow: "0 0 8px 4px rgba(0,255,100,0.6)" }} />
          </div>
        </div>
      ))}

      {/* Purple/green eerie glow spots */}
      {[20, 60, 85].map((x, i) => (
        <div key={i} className="animate-twinkle absolute" style={{ left: `${x}%`, top: "60%", "--duration": `${2 + i}s` } as React.CSSProperties}>
          <div style={{ width: 30, height: 15, background: `rgba(${i === 0 ? "150,0,255" : i === 1 ? "0,200,100" : "100,0,200"},0.3)`, borderRadius: "50%", filter: "blur(6px)" }} />
        </div>
      ))}

      {/* Mist at ground */}
      <div className="animate-mist absolute bottom-10 w-full" style={{ height: 30, background: "rgba(100,120,100,0.3)", borderRadius: 20, filter: "blur(8px)" }} />
      <div className="animate-mist absolute bottom-6 w-full" style={{ height: 20, background: "rgba(80,100,80,0.2)", borderRadius: 20, filter: "blur(5px)", animationDelay: "2s" }} />

      {/* Dark ground */}
      <div className="absolute bottom-0 w-full h-12" style={{ background: "#050a05" }} />
    </div>
  );
}
