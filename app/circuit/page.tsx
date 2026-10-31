"use client";

import { useRef, useState } from "react";

const turns = [
  { n: 1, name: "Turn 1 · Big Red", detail: "Start-finish straight climbs about 41 m to this blind uphill left-hander.", type: "Heavy braking" },
  { n: 2, name: "Turn 2", detail: "A tightening right-hander leading into the Esses.", type: "Flowing corner" },
  { n: 3, name: "Turn 3 · Esses", detail: "The fast left-right sequence begins.", type: "Fast direction change" },
  { n: 4, name: "Turn 4 · Esses", detail: "A quick transition through the Esses.", type: "Fast direction change" },
  { n: 5, name: "Turn 5 · Esses", detail: "The final part of the opening Esses sequence.", type: "Fast direction change" },
  { n: 6, name: "Turn 6", detail: "The Esses sequence opens toward the next sector.", type: "Medium speed" },
  { n: 7, name: "Turn 7", detail: "A flowing left-hander at the start of Sector 2.", type: "Flowing corner" },
  { n: 8, name: "Turn 8", detail: "A loaded right-hand corner.", type: "Sustained cornering" },
  { n: 9, name: "Turn 9", detail: "A short transition in the middle sector.", type: "Medium speed" },
  { n: 10, name: "Turn 10", detail: "A long left-hand corner before the hairpin.", type: "Braking zone" },
  { n: 11, name: "Turn 11 · Bobby Pin", detail: "A slow left hairpin leading onto the long back straight.", type: "Key exit" },
  { n: 12, name: "Turn 12", detail: "Heavy braking at the end of the back straight.", type: "Heavy braking" },
  { n: 13, name: "Turn 13", detail: "The stadium section begins.", type: "Stadium section" },
  { n: 14, name: "Turn 14", detail: "A right-hand transition in the stadium section.", type: "Technical section" },
  { n: 15, name: "Turn 15", detail: "A tight left-hander in the stadium complex.", type: "Technical section" },
  { n: 16, name: "Turn 16", detail: "The multi-apex sequence begins.", type: "Long corner" },
  { n: 17, name: "Turn 17", detail: "Continuation of the multi-apex right-hand sequence.", type: "Long corner" },
  { n: 18, name: "Turn 18", detail: "The final part of the multi-apex sequence.", type: "Direction change" },
  { n: 19, name: "Turn 19", detail: "A left-hand turn before the final corner.", type: "Medium speed" },
  { n: 20, name: "Turn 20", detail: "The final left-hander onto the start-finish straight.", type: "Exit speed" },
];

export default function CircuitExplorerPage() {
  const [selected, setSelected] = useState(0);
  const [viewMode, setViewMode] = useState<"elevation" | "speed">("elevation");
  const [zoom, setZoom] = useState(1);
  const [tilt, setTilt] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const active = turns[selected];

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 25%, #17122a 0%, #08080c 55%, #050505 100%)", color: "#f8f7fb", padding: "22px 16px 100px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ color: "#a78bfa", fontSize: 12, letterSpacing: 3, fontWeight: 900 }}>PURPLE SECTOR / CIRCUIT LAB</div>
        <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(30px, 7vw, 48px)", lineHeight: 1.05 }}>COTA <span style={{ color: "#a78bfa" }}>3D</span></h1>
        <p style={{ margin: 0, color: "#a9a3b5", lineHeight: 1.6 }}>Circuit of The Americas · United States Grand Prix</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, margin: "20px 0" }}>
          {[["LENGTH", "5.513 km"], ["CORNERS", "20"], ["LAYOUT", "Counter-clockwise"]].map(([label, value]) => <div key={label} style={{ background: "#111016", border: "1px solid #30253f", borderRadius: 12, padding: "12px 10px" }}><div style={{ color: "#898197", fontSize: 10, letterSpacing: 1.4, fontWeight: 800 }}>{label}</div><div style={{ marginTop: 5, fontSize: "clamp(12px,3vw,16px)", fontWeight: 800 }}>{value}</div></div>)}
        </div>

        <div style={{ display: "flex", gap: 8, margin: "18px 0 10px", padding: 5, border: "1px solid #342740", borderRadius: 14, background: "#100e16" }}><button onClick={() => { setViewMode("elevation"); setTilt(0); }} style={{ flex: 1, padding: "12px 8px", border: 0, borderRadius: 10, background: viewMode === "elevation" ? "#6d28d9" : "transparent", color: "#fff", fontWeight: 850 }}>⛰ 고저차 보기</button><button onClick={() => { setViewMode("speed"); setTilt(0); }} style={{ flex: 1, padding: "12px 8px", border: 0, borderRadius: 10, background: viewMode === "speed" ? "#6d28d9" : "transparent", color: "#fff", fontWeight: 850 }}>◉ 속도 보기</button></div>
        <section style={{ position: "relative", overflow: "hidden", borderRadius: 22, border: "1px solid #3c2b52", background: "linear-gradient(155deg,#0d0c15,#05060b 70%)", boxShadow: "0 20px 70px #0009", touchAction: "pan-y" }}>
          <div style={{ position: "absolute", zIndex: 2, top: 14, left: 14, right: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, pointerEvents: "none" }}>
            <span style={{ background: "#171321dd", border: "1px solid #443258", borderRadius: 999, padding: "7px 10px", fontSize: 10, letterSpacing: 1.2, fontWeight: 900 }}>INTERACTIVE TRACK VIEW</span>
            <span style={{ color: "#8e849f", fontSize: 11 }}>{viewMode === "elevation" ? "3D illustration · Drag to rotate · Pinch to zoom" : "Official sector map · Speed reference"}</span>
          </div>
          <div onPointerDown={(e) => { pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointersRef.current.size === 2) { const pts = Array.from(pointersRef.current.values()); pinchRef.current = { distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), zoom }; setDragging(false); } else { setDragging(true); setLastX(e.clientX); } e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (!pointersRef.current.has(e.pointerId)) return; pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointersRef.current.size >= 2) { const pts = Array.from(pointersRef.current.values()); const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y); if (pinchRef.current) setZoom(Math.max(0.75, Math.min(1.8, pinchRef.current.zoom * distance / Math.max(1, pinchRef.current.distance)))); } else if (dragging) { setTilt((v) => Math.max(-28, Math.min(28, v - (e.clientX - lastX) * 0.35))); setLastX(e.clientX); } }} onPointerUp={(e) => { pointersRef.current.delete(e.pointerId); if (pointersRef.current.size < 2) pinchRef.current = null; setDragging(false); }} onPointerCancel={(e) => { pointersRef.current.delete(e.pointerId); pinchRef.current = null; setDragging(false); }} style={{ height: viewMode === "elevation" ? "clamp(500px, 135vw, 680px)" : "clamp(280px, 62vw, 420px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", userSelect: "none", touchAction: "none" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", transform: `perspective(900px) rotateZ(${viewMode === "elevation" ? tilt : 0}deg) scale(${zoom})`, transition: dragging ? "none" : "transform 160ms ease-out", transformOrigin: "center center" }}>
              <img
                src={viewMode === "elevation" ? "/circuit/cota-elevation-rotated.webp" : "/circuit/cota-speed-official.webp"}
                alt={viewMode === "elevation" ? "COTA three-dimensional elevation illustration rotated clockwise to match the official circuit direction" : "Official COTA sector map used as the flat speed reference"}
                draggable={false}
                style={{ width: "100%", height: "100%", maxWidth: "100%", objectFit: "contain", display: "block", borderRadius: 12, pointerEvents: "none", userSelect: "none" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, padding: "0 16px 16px" }}>
            <span style={{ color: "#b9b0c7", fontSize: 12, whiteSpace: "nowrap" }}>PINCH TO ZOOM</span>
            <button onClick={() => { setZoom(1); setTilt(0); setSelected(0); }} style={{ border: "1px solid #3a2b4d", background: "#171321", color: "#eee", borderRadius: 10, padding: "9px 12px", fontWeight: 800 }}>Reset</button>
          </div>
        </section>

        <section style={{ marginTop: 14, border: "1px solid #342740", borderRadius: 18, background: "#100e18", padding: 18 }}>
          <div style={{ color: "#a78bfa", fontSize: 11, letterSpacing: 2, fontWeight: 900 }}>COTA ELEVATION REFERENCE</div>
          <h2 style={{ margin: "8px 0", fontSize: 24 }}>3D 고저차 참고 이미지</h2>
          <div style={{ fontSize: 32, fontWeight: 900 }}>+41 m</div>
          <p style={{ color: "#b7b0c2", lineHeight: 1.6, margin: "6px 0 0" }}>두 번째 3D 일러스트를 시계 방향 90° 회전해 공식 코스맵의 진행 방향에 맞췄어. +41m는 스타트/피니시에서 T1까지의 별도 소개 자료 기준이며, 이 그림 자체는 측량 DEM이 아닌 시각화 참고 자료야. 원본 크레딧: Jim Hatch.</p>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 14 }}>
          <div style={{ border: "1px solid #342740", borderRadius: 18, background: "#100e16", padding: 18 }}>
            <div style={{ color: "#a78bfa", fontSize: 11, letterSpacing: 2, fontWeight: 900 }}>SELECTED CORNER</div>
            <h2 style={{ margin: "8px 0", fontSize: 26 }}>{active.name}</h2>
            <p style={{ color: "#b7b0c2", lineHeight: 1.65, margin: 0 }}>{active.detail}</p>
            <div style={{ display: "inline-block", marginTop: 14, padding: "7px 10px", borderRadius: 999, background: "#241a36", color: "#c4b5fd", fontSize: 12, fontWeight: 800 }}>{active.type}</div>
          </div>
          <div style={{ border: "1px solid #342740", borderRadius: 18, background: "#100e16", padding: 18 }}>
            <div style={{ color: "#a78bfa", fontSize: 11, letterSpacing: 2, fontWeight: 900 }}>EXPLORE CORNERS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>{turns.map((turn, i) => <button key={turn.n} onClick={() => setSelected(i)} style={{ minWidth: 42, padding: "10px 12px", borderRadius: 10, border: selected === i ? "1px solid #c4b5fd" : "1px solid #383044", background: selected === i ? "#6d28d9" : "#17151d", color: "white", fontWeight: 850 }}>T{turn.n}</button>)}</div>
            <p style={{ color: "#777084", fontSize: 11, lineHeight: 1.5, marginBottom: 0 }}>고저차 탭은 회전한 3D 일러스트, 속도 탭은 공식 섹터 맵을 사용해. 두 그림은 투영 방식이 달라 세부 곡선이 완전히 겹치는 측량 데이터는 아니야.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
