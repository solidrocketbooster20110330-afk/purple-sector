"use client";

import { useRef, useState } from "react";

const turns = [
  { n: 1, x: 530, y: 115, name: "Turn 1", detail: "The steep uphill braking zone into the first corner.", type: "Heavy braking" },
  { n: 2, x: 470, y: 100, name: "Turn 2", detail: "A fast transition that begins the esses sequence.", type: "Fast direction change" },
  { n: 3, x: 430, y: 125, name: "Turn 3", detail: "A quick left-right change through the opening esses.", type: "Esses" },
  { n: 4, x: 390, y: 105, name: "Turn 4", detail: "A flowing corner in the high-speed first sector.", type: "Esses" },
  { n: 5, x: 350, y: 130, name: "Turn 5", detail: "The final part of the opening direction-change sequence.", type: "Esses" },
  { n: 6, x: 320, y: 165, name: "Turn 6", detail: "The track starts to unwind toward the next section.", type: "Medium speed" },
  { n: 7, x: 345, y: 215, name: "Turn 7", detail: "A corner that sets up the run through the middle sector.", type: "Medium speed" },
  { n: 8, x: 390, y: 240, name: "Turn 8", detail: "A flowing change of direction.", type: "Flowing corner" },
  { n: 9, x: 435, y: 225, name: "Turn 9", detail: "Completes the flowing section before the tighter turns.", type: "Flowing corner" },
  { n: 10, x: 480, y: 250, name: "Turn 10", detail: "A tighter corner before the stadium section.", type: "Medium braking" },
  { n: 11, x: 500, y: 300, name: "Turn 11", detail: "A slow corner that leads onto the long back straight.", type: "Straight-line setup" },
  { n: 12, x: 165, y: 300, name: "Turn 12", detail: "A major braking zone at the end of the long back straight.", type: "Heavy braking" },
  { n: 13, x: 175, y: 360, name: "Turn 13", detail: "The stadium section begins with a tight sequence.", type: "Technical section" },
  { n: 14, x: 215, y: 395, name: "Turn 14", detail: "A short transition through the stadium complex.", type: "Technical section" },
  { n: 15, x: 270, y: 410, name: "Turn 15", detail: "A multi-apex corner where a tidy line matters.", type: "Technical section" },
  { n: 16, x: 325, y: 390, name: "Turn 16", detail: "The first of the final long, sweeping corners.", type: "Long-radius corner" },
  { n: 17, x: 380, y: 370, name: "Turn 17", detail: "A long-radius corner that builds speed toward the final sector.", type: "Long-radius corner" },
  { n: 18, x: 430, y: 345, name: "Turn 18", detail: "Continues the sweeping sequence.", type: "Long-radius corner" },
  { n: 19, x: 485, y: 320, name: "Turn 19", detail: "A fast approach to the final corner.", type: "Final sector" },
  { n: 20, x: 545, y: 275, name: "Turn 20", detail: "The final corner onto the main straight.", type: "Final corner" },
];

export default function CircuitExplorerPage() {
  const [selected, setSelected] = useState(0);
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

        <section style={{ position: "relative", overflow: "hidden", borderRadius: 22, border: "1px solid #3c2b52", background: "linear-gradient(155deg,#0d0c15,#05060b 70%)", boxShadow: "0 20px 70px #0009", touchAction: "pan-y" }}>
          <div style={{ position: "absolute", zIndex: 2, top: 14, left: 14, right: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, pointerEvents: "none" }}>
            <span style={{ background: "#171321dd", border: "1px solid #443258", borderRadius: 999, padding: "7px 10px", fontSize: 10, letterSpacing: 1.2, fontWeight: 900 }}>INTERACTIVE TRACK VIEW</span>
            <span style={{ color: "#8e849f", fontSize: 11 }}>Drag to rotate · Pinch to zoom</span>
          </div>
          <div onPointerDown={(e) => { pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointersRef.current.size === 2) { const pts = Array.from(pointersRef.current.values()); pinchRef.current = { distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), zoom }; setDragging(false); } else { setDragging(true); setLastX(e.clientX); } e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (!pointersRef.current.has(e.pointerId)) return; pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointersRef.current.size >= 2) { const pts = Array.from(pointersRef.current.values()); const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y); if (pinchRef.current) setZoom(Math.max(0.75, Math.min(1.8, pinchRef.current.zoom * distance / Math.max(1, pinchRef.current.distance)))); } else if (dragging) { setTilt((v) => Math.max(-28, Math.min(28, v - (e.clientX - lastX) * 0.35))); setLastX(e.clientX); } }} onPointerUp={(e) => { pointersRef.current.delete(e.pointerId); if (pointersRef.current.size < 2) pinchRef.current = null; setDragging(false); }} onPointerCancel={(e) => { pointersRef.current.delete(e.pointerId); pinchRef.current = null; setDragging(false); }} style={{ height: "clamp(340px, 105vw, 540px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", userSelect: "none", touchAction: "none" }}>
            <div style={{ width: "100%", transform: `perspective(900px) rotateX(48deg) rotateZ(${tilt}deg) scale(${zoom})`, transition: dragging ? "none" : "transform 160ms ease-out", transformOrigin: "center center" }}>
              <svg viewBox="0 0 700 560" role="img" aria-label="Stylized 3D COTA circuit layout" style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}>
                <defs>
                  <linearGradient id="trackGlow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="28%" stopColor="#fb7185"/><stop offset="55%" stopColor="#a78bfa"/><stop offset="78%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
                  <filter id="glow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#292239" strokeWidth="0.7"/></pattern>
                </defs>
                <rect width="700" height="560" fill="url(#grid)" opacity=".48"/>
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M555 135 C548 120 540 112 530 115 C510 118 492 102 470 100 C450 98 440 116 430 125 C415 119 405 105 390 105 C375 105 365 121 350 130 C333 140 318 151 320 170 C321 190 334 207 345 215 C360 232 379 246 400 245 C421 244 439 231 455 230 C475 229 490 246 497 266 C503 283 500 296 500 300 C445 300 390 300 335 300 C280 300 220 300 165 300 C155 315 157 335 170 352 C183 369 200 386 220 397 C241 409 268 413 290 405 C313 397 329 383 350 380 C376 376 398 363 420 352 C445 340 470 332 492 316 C514 301 533 281 542 260 C550 242 539 226 523 216 C507 206 500 191 508 173 C517 155 539 143 555 135 Z" stroke="#252037" strokeWidth="40" transform="translate(0 15)"/>
                  <path d="M555 135 C548 120 540 112 530 115 C510 118 492 102 470 100 C450 98 440 116 430 125 C415 119 405 105 390 105 C375 105 365 121 350 130 C333 140 318 151 320 170 C321 190 334 207 345 215 C360 232 379 246 400 245 C421 244 439 231 455 230 C475 229 490 246 497 266 C503 283 500 296 500 300 C445 300 390 300 335 300 C280 300 220 300 165 300 C155 315 157 335 170 352 C183 369 200 386 220 397 C241 409 268 413 290 405 C313 397 329 383 350 380 C376 376 398 363 420 352 C445 340 470 332 492 316 C514 301 533 281 542 260 C550 242 539 226 523 216 C507 206 500 191 508 173 C517 155 539 143 555 135 Z" stroke="#07070b" strokeWidth="28"/>
                  <path d="M555 135 C548 120 540 112 530 115 C510 118 492 102 470 100 C450 98 440 116 430 125 C415 119 405 105 390 105 C375 105 365 121 350 130 C333 140 318 151 320 170 C321 190 334 207 345 215 C360 232 379 246 400 245 C421 244 439 231 455 230 C475 229 490 246 497 266 C503 283 500 296 500 300 C445 300 390 300 335 300 C280 300 220 300 165 300 C155 315 157 335 170 352 C183 369 200 386 220 397 C241 409 268 413 290 405 C313 397 329 383 350 380 C376 376 398 363 420 352 C445 340 470 332 492 316 C514 301 533 281 542 260 C550 242 539 226 523 216 C507 206 500 191 508 173 C517 155 539 143 555 135 Z" stroke="url(#trackGlow)" strokeWidth="12" filter="url(#glow)"/>
                  <path d="M555 135 C548 120 540 112 530 115 C510 118 492 102 470 100 C450 98 440 116 430 125 C415 119 405 105 390 105 C375 105 365 121 350 130 C333 140 318 151 320 170 C321 190 334 207 345 215 C360 232 379 246 400 245 C421 244 439 231 455 230 C475 229 490 246 497 266 C503 283 500 296 500 300 C445 300 390 300 335 300 C280 300 220 300 165 300 C155 315 157 335 170 352 C183 369 200 386 220 397 C241 409 268 413 290 405 C313 397 329 383 350 380 C376 376 398 363 420 352 C445 340 470 332 492 316 C514 301 533 281 542 260 C550 242 539 226 523 216 C507 206 500 191 508 173 C517 155 539 143 555 135 Z" stroke="#f8fafc" strokeWidth="1.6" opacity=".9"/>
                </g>
                {turns.map((turn) => <g key={turn.n} onClick={(event) => { event.stopPropagation(); setSelected(turns.findIndex((item) => item.n === turn.n)); }} style={{ cursor: "pointer" }}><circle cx={turn.x} cy={turn.y} r={selected === turns.findIndex((item) => item.n === turn.n) ? 17 : 12} fill={selected === turns.findIndex((item) => item.n === turn.n) ? "#a78bfa" : "#0a0910"} stroke={selected === turns.findIndex((item) => item.n === turn.n) ? "#fff" : "#b9a4e8"} strokeWidth="2"/><text x={turn.x} y={turn.y+4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">{turn.n}</text></g>)}
                <g><rect x="525" y="163" width="8" height="42" rx="2" fill="#f8fafc"/><path d="M533 163 h18 v10 h-18 M533 183 h18 v10 h-18" fill="#f8fafc"/><path d="M533 173 h18 M533 193 h18" stroke="#111" strokeWidth="5"/></g>
                <text x="35" y="520" fill="#756a8d" fontSize="12" letterSpacing="2">COTA TRACK MAP · PROTOTYPE GEOMETRY</text>
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, padding: "0 16px 16px" }}>
            <span style={{ color: "#b9b0c7", fontSize: 12, whiteSpace: "nowrap" }}>PINCH TO ZOOM</span>
            <button onClick={() => { setZoom(1); setTilt(0); setSelected(0); }} style={{ border: "1px solid #3a2b4d", background: "#171321", color: "#eee", borderRadius: 10, padding: "9px 12px", fontWeight: 800 }}>Reset</button>
          </div>
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
            <p style={{ color: "#777084", fontSize: 11, lineHeight: 1.5, marginBottom: 0 }}>Turn markers and the track outline are an interactive prototype, not surveyed GPS geometry. Corner notes are descriptive guidance, not live telemetry.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
