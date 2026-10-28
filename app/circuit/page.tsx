"use client";

import { useState } from "react";

const turns = [
  { n: 1, x: 570, y: 185, name: "Turn 1", detail: "A steep uphill approach into a tight, heavy-braking hairpin.", type: "Heavy braking" },
  { n: 2, x: 510, y: 245, name: "Turns 2–3", detail: "A flowing sequence that asks for commitment and precise placement.", type: "Fast direction change" },
  { n: 4, x: 465, y: 285, name: "Turn 4", detail: "A quick change of direction on the way into the middle sector.", type: "Medium speed" },
  { n: 6, x: 405, y: 345, name: "Turns 6–7", detail: "A technical section where line choice matters.", type: "Technical section" },
  { n: 9, x: 335, y: 300, name: "Turns 9–10", detail: "A flowing transition before the tighter sequence.", type: "Flowing corners" },
  { n: 11, x: 260, y: 345, name: "Turn 11", detail: "A key corner leading onto the long back straight.", type: "Straight-line setup" },
  { n: 12, x: 180, y: 410, name: "Turn 12", detail: "A major braking zone at the end of the back straight.", type: "Heavy braking" },
  { n: 15, x: 250, y: 475, name: "Turns 15–16", detail: "A tight technical complex where a clean exit helps.", type: "Technical section" },
  { n: 19, x: 445, y: 470, name: "Turns 19–20", detail: "The final sequence before the run back to the start/finish.", type: "Final sector" },
];

export default function CircuitExplorerPage() {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [tilt, setTilt] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
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
            <span style={{ color: "#8e849f", fontSize: 11 }}>Drag to rotate</span>
          </div>
          <div onPointerDown={(e) => { setDragging(true); setLastX(e.clientX); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (dragging) { setTilt((v) => Math.max(-28, Math.min(28, v + (e.clientX - lastX) * 0.35))); setLastX(e.clientX); } }} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)} style={{ height: "clamp(340px, 105vw, 540px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", userSelect: "none" }}>
            <div style={{ width: "100%", transform: `perspective(900px) rotateX(48deg) rotateZ(${tilt}deg) scale(${zoom})`, transition: dragging ? "none" : "transform 160ms ease-out", transformOrigin: "center center" }}>
              <svg viewBox="0 0 700 560" role="img" aria-label="Stylized 3D COTA circuit layout" style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}>
                <defs>
                  <linearGradient id="trackGlow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="28%" stopColor="#fb7185"/><stop offset="55%" stopColor="#a78bfa"/><stop offset="78%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
                  <filter id="glow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#292239" strokeWidth="0.7"/></pattern>
                </defs>
                <rect width="700" height="560" fill="url(#grid)" opacity=".48"/>
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M570 185 C560 145 530 130 490 145 L420 180 C395 190 380 215 390 240 L420 280 C440 310 420 330 390 330 L340 310 C310 295 285 300 260 345 L220 385 C195 405 165 405 150 430 C130 460 170 480 210 480 L370 480 C420 480 455 460 455 425 C455 400 430 390 405 395 L340 410 C310 420 290 400 305 375 C325 345 360 350 370 375 C380 400 410 410 440 390 L510 350 C550 330 570 300 550 270 L520 240 C500 220 510 200 535 195 Z" stroke="#252037" strokeWidth="40" transform="translate(0 15)"/>
                  <path d="M570 185 C560 145 530 130 490 145 L420 180 C395 190 380 215 390 240 L420 280 C440 310 420 330 390 330 L340 310 C310 295 285 300 260 345 L220 385 C195 405 165 405 150 430 C130 460 170 480 210 480 L370 480 C420 480 455 460 455 425 C455 400 430 390 405 395 L340 410 C310 420 290 400 305 375 C325 345 360 350 370 375 C380 400 410 410 440 390 L510 350 C550 330 570 300 550 270 L520 240 C500 220 510 200 535 195 Z" stroke="#07070b" strokeWidth="28"/>
                  <path d="M570 185 C560 145 530 130 490 145 L420 180 C395 190 380 215 390 240 L420 280 C440 310 420 330 390 330 L340 310 C310 295 285 300 260 345 L220 385 C195 405 165 405 150 430 C130 460 170 480 210 480 L370 480 C420 480 455 460 455 425 C455 400 430 390 405 395 L340 410 C310 420 290 400 305 375 C325 345 360 350 370 375 C380 400 410 410 440 390 L510 350 C550 330 570 300 550 270 L520 240 C500 220 510 200 535 195 Z" stroke="url(#trackGlow)" strokeWidth="12" filter="url(#glow)"/>
                  <path d="M570 185 C560 145 530 130 490 145 L420 180 C395 190 380 215 390 240 L420 280 C440 310 420 330 390 330 L340 310 C310 295 285 300 260 345 L220 385 C195 405 165 405 150 430 C130 460 170 480 210 480 L370 480 C420 480 455 460 455 425 C455 400 430 390 405 395 L340 410 C310 420 290 400 305 375 C325 345 360 350 370 375 C380 400 410 410 440 390 L510 350 C550 330 570 300 550 270 L520 240 C500 220 510 200 535 195 Z" stroke="#f8fafc" strokeWidth="1.6" opacity=".9"/>
                </g>
                {turns.map((turn) => <g key={turn.n} onClick={(event) => { event.stopPropagation(); setSelected(turns.findIndex((item) => item.n === turn.n)); }} style={{ cursor: "pointer" }}><circle cx={turn.x} cy={turn.y} r={selected === turns.findIndex((item) => item.n === turn.n) ? 17 : 12} fill={selected === turns.findIndex((item) => item.n === turn.n) ? "#a78bfa" : "#0a0910"} stroke={selected === turns.findIndex((item) => item.n === turn.n) ? "#fff" : "#b9a4e8"} strokeWidth="2"/><text x={turn.x} y={turn.y+4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">{turn.n}</text></g>)}
                <g><rect x="525" y="163" width="8" height="42" rx="2" fill="#f8fafc"/><path d="M533 163 h18 v10 h-18 M533 183 h18 v10 h-18" fill="#f8fafc"/><path d="M533 173 h18 M533 193 h18" stroke="#111" strokeWidth="5"/></g>
                <text x="35" y="520" fill="#756a8d" fontSize="12" letterSpacing="2">CIRCUIT EXPLORER · SCHEMATIC LAYOUT</text>
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px 16px" }}>
            <span style={{ color: "#b9b0c7", fontSize: 12, whiteSpace: "nowrap" }}>ZOOM</span>
            <input aria-label="Track zoom" type="range" min="0.75" max="1.4" step="0.05" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: "100%", accentColor: "#a78bfa" }}/>
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
            <p style={{ color: "#777084", fontSize: 11, lineHeight: 1.5, marginBottom: 0 }}>Corner notes are descriptive guidance, not live telemetry. Track illustration is a first-pass schematic.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
