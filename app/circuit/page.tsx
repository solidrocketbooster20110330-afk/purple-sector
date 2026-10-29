"use client";

import { useRef, useState } from "react";

const turns = [
  { n: 1, x: 448, y: 48, name: "Turn 1 · Big Red", detail: "A steep uphill approach into a blind, tight corner.", type: "Heavy braking" },
  { n: 2, x: 405, y: 82, name: "Turn 2", detail: "A long, tightening corner that begins the esses sequence.", type: "Flowing corner" },
  { n: 3, x: 360, y: 117, name: "Turn 3 · Esses", detail: "The opening of the fast left-right sequence.", type: "Fast direction change" },
  { n: 4, x: 330, y: 142, name: "Turn 4 · Esses", detail: "A quick transition through the esses.", type: "Fast direction change" },
  { n: 5, x: 325, y: 170, name: "Turn 5 · Esses", detail: "The final part of the opening esses.", type: "Fast direction change" },
  { n: 6, x: 348, y: 205, name: "Turn 6", detail: "The circuit opens out after the esses.", type: "Medium speed" },
  { n: 7, x: 376, y: 232, name: "Turn 7", detail: "A flowing bend leading toward the next section.", type: "Flowing corner" },
  { n: 8, x: 407, y: 242, name: "Turn 8", detail: "A long, loaded corner in the middle sector.", type: "Sustained cornering" },
  { n: 9, x: 430, y: 224, name: "Turn 9", detail: "A transition toward the back section.", type: "Medium speed" },
  { n: 10, x: 439, y: 198, name: "Turn 10", detail: "A tight corner before the run to Turn 11.", type: "Braking zone" },
  { n: 11, x: 430, y: 172, name: "Turn 11 · Bobby Pin", detail: "A slow hairpin leading onto the long back straight.", type: "Key exit" },
  { n: 12, x: 365, y: 305, name: "Turn 12", detail: "A major braking zone at the end of the long back straight.", type: "Heavy braking" },
  { n: 13, x: 318, y: 340, name: "Turn 13", detail: "The stadium section begins with a long right-hander.", type: "Stadium section" },
  { n: 14, x: 285, y: 372, name: "Turn 14", detail: "A transition within the stadium complex.", type: "Technical section" },
  { n: 15, x: 245, y: 395, name: "Turn 15", detail: "A tight corner in the stadium complex.", type: "Technical section" },
  { n: 16, x: 205, y: 390, name: "Turn 16", detail: "The long, flowing triple-apex sequence begins.", type: "Long corner" },
  { n: 17, x: 180, y: 370, name: "Turn 17", detail: "A continuation of the long cornering sequence.", type: "Long corner" },
  { n: 18, x: 165, y: 345, name: "Turn 18", detail: "The track turns back toward the final sector.", type: "Direction change" },
  { n: 19, x: 185, y: 310, name: "Turn 19", detail: "A quick transition before the final corner.", type: "Medium speed" },
  { n: 20, x: 245, y: 290, name: "Turn 20", detail: "The final corner returns the car to the start-finish straight.", type: "Exit speed" },
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
              <svg viewBox="0 0 500 500" role="img" aria-label="COTA circuit layout based on F1DB circuit SVG" style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}>
                <defs>
                  <linearGradient id="trackGlow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="28%" stopColor="#fb7185"/><stop offset="55%" stopColor="#a78bfa"/><stop offset="78%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
                  <filter id="glow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#292239" strokeWidth="0.7"/></pattern>
                </defs>
                <rect width="500" height="500" fill="url(#grid)" opacity=".48"/>
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" stroke="#252037" strokeWidth="40" transform="translate(0 15)"/>
                  <path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" stroke="#07070b" strokeWidth="28"/>
                  <path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" stroke="url(#trackGlow)" strokeWidth="12" filter="url(#glow)"/>
                  <path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" stroke="#f8fafc" strokeWidth="1.6" opacity=".9"/>
                </g>
                {turns.map((turn) => <g key={turn.n} onClick={(event) => { event.stopPropagation(); setSelected(turns.findIndex((item) => item.n === turn.n)); }} style={{ cursor: "pointer" }}><circle cx={turn.x} cy={turn.y} r={selected === turns.findIndex((item) => item.n === turn.n) ? 17 : 12} fill={selected === turns.findIndex((item) => item.n === turn.n) ? "#a78bfa" : "#0a0910"} stroke={selected === turns.findIndex((item) => item.n === turn.n) ? "#fff" : "#b9a4e8"} strokeWidth="2"/><text x={turn.x} y={turn.y+4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">{turn.n}</text></g>)}
                <g transform="translate(446 34) rotate(24)"><rect x="-3" y="-14" width="6" height="28" rx="1" fill="#f8fafc"/><path d="M3 -14 h12 v7 H3 M3 0 h12 v7 H3" fill="#f8fafc"/><path d="M3 -7 h12 M3 7 h12" stroke="#111" strokeWidth="4"/></g>
                <text x="35" y="520" fill="#756a8d" fontSize="12" letterSpacing="2">COTA TRACK MAP · PROTOTYPE GEOMETRY</text>
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, padding: "0 16px 16px" }}>
            <span style={{ color: "#b9b0c7", fontSize: 12, whiteSpace: "nowrap" }}>PINCH TO ZOOM</span>
            <button onClick={() => { setZoom(1); setTilt(0); setSelected(0); }} style={{ border: "1px solid #3a2b4d", background: "#171321", color: "#eee", borderRadius: 10, padding: "9px 12px", fontWeight: 800 }}>Reset</button>
          </div>
        </section>

        <section style={{ marginTop: 14, border: "1px solid #342740", borderRadius: 18, background: "linear-gradient(145deg,#100e18,#08090f)", padding: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ color: "#a78bfa", fontSize: 11, letterSpacing: 2, fontWeight: 900 }}>ELEVATION PROFILE</div>
              <h2 style={{ margin: "7px 0 4px", fontSize: 24 }}>COTA 지형 고도</h2>
              <p style={{ margin: 0, color: "#a9a3b5", fontSize: 13, lineHeight: 1.5 }}>출발선에서 T1까지 약 41m 상승 · 서킷의 전체 고도차 약 41m</p>
            </div>
            <div style={{ background: "#21182e", border: "1px solid #4b3565", borderRadius: 12, padding: "10px 13px" }}>
              <div style={{ color: "#a78bfa", fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>ELEVATION CHANGE</div>
              <div style={{ fontSize: 23, fontWeight: 900, marginTop: 3 }}>≈ 41 m</div>
              <div style={{ color: "#8f879e", fontSize: 11 }}>133 ft</div>
            </div>
          </div>
          <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden", background: "#090a11", border: "1px solid #252035", padding: "10px 8px 4px" }}>
            <svg viewBox="0 0 700 205" role="img" aria-label="Approximate COTA circuit elevation profile" style={{ display: "block", width: "100%", height: "auto" }}>
              <defs>
                <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity=".55"/><stop offset="100%" stopColor="#a78bfa" stopOpacity=".02"/></linearGradient>
                <linearGradient id="elevLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#22d3ee"/><stop offset="25%" stopColor="#a78bfa"/><stop offset="55%" stopColor="#fb7185"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient>
              </defs>
              {[35,75,115,155].map(y => <line key={y} x1="28" y1={y} x2="680" y2={y} stroke="#292338" strokeDasharray="4 6"/>)}
              <path d="M28 120 L55 112 L82 32 L105 52 L135 83 L165 102 L195 92 L225 108 L255 124 L285 136 L315 126 L345 142 L375 150 L405 137 L435 126 L465 142 L495 155 L525 165 L555 145 L585 132 L615 113 L645 96 L680 120 L680 175 L28 175 Z" fill="url(#elevFill)"/>
              <path d="M28 120 L55 112 L82 32 L105 52 L135 83 L165 102 L195 92 L225 108 L255 124 L285 136 L315 126 L345 142 L375 150 L405 137 L435 126 L465 142 L495 155 L525 165 L555 145 L585 132 L615 113 L645 96 L680 120" fill="none" stroke="url(#elevLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="82" cy="32" r="6" fill="#fb7185" stroke="#fff" strokeWidth="2"/>
              <text x="95" y="25" fill="#fda4af" fontSize="13" fontWeight="800">T1 · HIGH POINT</text>
              <circle cx="525" cy="165" r="5" fill="#22d3ee" stroke="#fff" strokeWidth="1.5"/>
              <text x="505" y="192" fill="#67e8f9" fontSize="12" fontWeight="800" textAnchor="middle">T19–20 · LOW AREA</text>
              <text x="28" y="194" fill="#8e849f" fontSize="11">START / FINISH</text>
              <text x="680" y="194" fill="#8e849f" fontSize="11" textAnchor="end">LAP</text>
            </svg>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 9, marginTop: 12 }}>
            <div style={{ background: "#15111e", borderRadius: 10, padding: 12 }}><div style={{ color: "#fb7185", fontSize: 11, fontWeight: 900 }}>T1 UPHILL</div><div style={{ fontSize: 14, fontWeight: 800, marginTop: 5 }}>약 41m 상승</div><div style={{ color: "#8f879e", fontSize: 11, marginTop: 3 }}>급경사 오르막과 헤어핀</div></div>
            <div style={{ background: "#15111e", borderRadius: 10, padding: 12 }}><div style={{ color: "#22d3ee", fontSize: 11, fontWeight: 900 }}>T19–20 LOW AREA</div><div style={{ fontSize: 14, fontWeight: 800, marginTop: 5 }}>서킷 최저 구간 부근</div><div style={{ color: "#8f879e", fontSize: 11, marginTop: 3 }}>T1 오르막과 대비되는 낮은 지형</div></div>
          </div>
          <p style={{ color: "#777084", fontSize: 11, lineHeight: 1.55, margin: "12px 0 0" }}>주의: 곡선은 지형 변화를 이해하기 위한 개략도이며, 코너별 측량 고도 데이터가 아닙니다. 공개된 COTA/F1 자료의 T1 고도 상승은 약 130–134ft(약 40–41m)입니다.</p>
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
