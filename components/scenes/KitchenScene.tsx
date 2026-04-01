"use client";

export default function KitchenScene() {
  return (
    <div className="relative w-full h-72 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFECD2 100%)" }}>
      {/* Window with light */}
      <div className="absolute" style={{ top: 12, right: 30, width: 80, height: 70, background: "#87CEEB", border: "6px solid #A0522D", borderRadius: 4 }}>
        <div style={{ position: "absolute", top: 0, left: "50%", width: 3, height: "100%", background: "#A0522D" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 3, background: "#A0522D" }} />
        {/* Light rays */}
        <div style={{ position: "absolute", top: 5, left: 5, width: 30, height: 25, background: "rgba(255,255,150,0.4)", borderRadius: "0 0 100% 0" }} />
      </div>

      {/* Wall shelf */}
      <div className="absolute" style={{ top: 80, left: 20, right: 130, height: 10, background: "#8B5E3C", borderRadius: 2 }} />
      {/* Items on shelf */}
      <div className="absolute" style={{ top: 50, left: 30, width: 25, height: 35, background: "#E74C3C", borderRadius: "50% 50% 20% 20%" }}>
        <div style={{ width: 8, height: 8, background: "#C0392B", borderRadius: "50%", margin: "5px auto 0" }} />
      </div>
      <div className="absolute" style={{ top: 55, left: 65, width: 20, height: 30, background: "#2ECC71", borderRadius: 4 }} />
      <div className="absolute" style={{ top: 48, left: 95, width: 22, height: 38, background: "#3498DB", borderRadius: "50% 50% 10% 10%", border: "2px solid #2980B9" }} />

      {/* Table */}
      <div className="absolute" style={{ bottom: 50, left: "10%", right: "10%", height: 12, background: "#8B5E3C", borderRadius: 4 }} />
      <div className="absolute" style={{ bottom: 50, left: "12%", width: 10, height: 50, background: "#6B4226" }} />
      <div className="absolute" style={{ bottom: 50, right: "12%", width: 10, height: 50, background: "#6B4226" }} />

      {/* Bowl with steam */}
      <div className="absolute" style={{ bottom: 62, left: "35%" }}>
        <div style={{ width: 60, height: 35, background: "#F5F5DC", borderRadius: "0 0 30px 30px", border: "3px solid #DDD", position: "relative" }}>
          <div style={{ position: "absolute", top: 5, left: 10, right: 10, height: 18, background: "#8B4513", borderRadius: 8, opacity: 0.6 }} />
        </div>
        {/* Steam */}
        {[0, 1, 2].map(i => (
          <div key={i} className="animate-rise absolute" style={{ bottom: 35, left: 10 + i * 18, width: 8, height: 8, background: "rgba(200,200,200,0.5)", borderRadius: "50%", animationDelay: `${i * 0.7}s` }} />
        ))}
      </div>

      {/* Bread loaf */}
      <div className="absolute" style={{ bottom: 62, right: "25%", width: 55, height: 35, background: "#D2691E", borderRadius: "50% 50% 10% 10%", border: "2px solid #A0522D" }}>
        <div style={{ position: "absolute", top: 4, left: 5, right: 5, height: 8, background: "rgba(0,0,0,0.1)", borderRadius: 4 }} />
      </div>

      {/* Floor */}
      <div className="absolute bottom-0 w-full h-12" style={{ background: "repeating-linear-gradient(90deg, #C19A6B 0px, #C19A6B 40px, #B8860B 40px, #B8860B 42px)" }} />
    </div>
  );
}
