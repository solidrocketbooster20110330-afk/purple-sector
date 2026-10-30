"use client";

import { useEffect, useRef, useState } from "react";

const turnDistances = [662, 855, 1155, 1270, 1362, 1582, 1719, 1930, 1969, 2182, 2598, 3777, 3990, 4113, 4298, 4506, 4617, 4703, 5054, 5364];
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
  const [turnPoints, setTurnPoints] = useState<{x:number;y:number}[]>([]);
  const trackPathRef = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    const path = trackPathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    setTurnPoints(turnDistances.map((metres) => {
      const p = path.getPointAtLength((metres / 5513) * total);
      return { x: p.x, y: p.y };
    }));
  }, []);
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
            <span style={{ color: "#8e849f", fontSize: 11 }}>{viewMode === "elevation" ? "3D terrain · Drag to rotate · Pinch to zoom" : "Flat lap replay · Smooth motion"}</span>
          </div>
          <div onPointerDown={(e) => { pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointersRef.current.size === 2) { const pts = Array.from(pointersRef.current.values()); pinchRef.current = { distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), zoom }; setDragging(false); } else { setDragging(true); setLastX(e.clientX); } e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (!pointersRef.current.has(e.pointerId)) return; pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointersRef.current.size >= 2) { const pts = Array.from(pointersRef.current.values()); const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y); if (pinchRef.current) setZoom(Math.max(0.75, Math.min(1.8, pinchRef.current.zoom * distance / Math.max(1, pinchRef.current.distance)))); } else if (dragging) { setTilt((v) => Math.max(-28, Math.min(28, v - (e.clientX - lastX) * 0.35))); setLastX(e.clientX); } }} onPointerUp={(e) => { pointersRef.current.delete(e.pointerId); if (pointersRef.current.size < 2) pinchRef.current = null; setDragging(false); }} onPointerCancel={(e) => { pointersRef.current.delete(e.pointerId); pinchRef.current = null; setDragging(false); }} style={{ height: "clamp(340px, 105vw, 540px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", userSelect: "none", touchAction: "none" }}>
            <div style={{ width: "100%", transform: `perspective(900px) rotateX(${viewMode === "elevation" ? 48 : 0}deg) rotateZ(${viewMode === "elevation" ? tilt : 0}deg) scale(${zoom})`, transition: dragging ? "none" : "transform 160ms ease-out", transformOrigin: "center center" }}>
              <svg viewBox="0 0 500 500" role="img" aria-label="COTA circuit layout based on F1DB circuit SVG" style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}>
                <defs>
                  <linearGradient id="trackGlow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="28%" stopColor="#fb7185"/><stop offset="55%" stopColor="#a78bfa"/><stop offset="78%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
                  <filter id="glow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#292239" strokeWidth="0.7"/></pattern>
                </defs>
                <rect width="500" height="500" fill="url(#grid)" opacity=".48"/>
                {viewMode === "elevation" && <g opacity=".45"><path d="M463 42 L449 50 L430 70" stroke="#f472b6" strokeWidth="2" fill="none"/><text x="405" y="65" fill="#f9a8d4" fontSize="10">T1 +41 m</text></g>}
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" stroke="#252037" strokeWidth="40" transform="translate(0 15)"/>
                  <path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" stroke="#07070b" strokeWidth="28" ref={trackPathRef}/>
                  <path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" stroke="url(#trackGlow)" strokeWidth="12" filter="url(#glow)"/>
                  <path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" stroke="#f8fafc" strokeWidth="1.6" opacity=".9"/>
                </g>
                {viewMode === "speed" && <g><path d="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z" fill="none" stroke="#22d3ee" strokeWidth="5" opacity=".9" strokeLinecap="round"/><circle r="8" fill="#fff" stroke="#22d3ee" strokeWidth="4"><animateMotion dur="92s" repeatCount="indefinite" rotate="auto" path="M463.201 42.551c-3.095-4.166-9.585-4.959-13.542-1.491-105.774 92.51-189.942 140.467-271.342 186.844l-1.43.818a8.79 8.79 0 0 0-4.448 7.319 8.87 8.87 0 0 0 3.861 7.726c10.004 6.86 18.037 11.893 24.491 15.937 9.44 5.913 15.39 9.643 19.06 13.81l-12.113 5.437c-1.335.598-2.524.903-3.537.903-1.238 0-2.939-.402-5.131-3.54l-4.563-6.535a13.1 13.1 0 0 0-5.448-4.483l-11.76-5.206a13.07 13.07 0 0 0-9.396-.459l-11.38 3.769c-3.1 1.023-5.339 3.555-5.99 6.772a9.12 9.12 0 0 0 2.897 8.64c6.81 5.996 14.065 10.876 21.083 15.595 7.814 5.256 15.205 10.224 20.324 15.78 1.003 1.77 5.673 10.775 4.745 22.995a9.66 9.66 0 0 1-2.139 5.317c-3.422 4.198-9.976 11.888-15.405 16.219a9.1 9.1 0 0 1-3.476 1.72c-2.734.69-8.336 1.847-15.156 1.847a58 58 0 0 1-9.102-.709c-.999-.161-2.029-.56-3.066-1.183l-47.373-28.484c-5.617-3.377-13.355-2.265-17.802 2.544l-48.214 52.06a10.69 10.69 0 0 0-2.47 10.18c1 3.624 3.746 6.404 7.344 7.44l211.465 60.794c.8.23 1.623.349 2.44.349h.004c3.202 0 6.146-1.782 7.68-4.652 1.537-2.871 1.379-6.22-.42-8.954-4.86-7.388-12.923-18.609-23.722-30.107-15.686-16.704-17.69-29.534-6.913-44.286 8.675-11.876 21.268-28.367 28.003-37.141a19.36 19.36 0 0 0 4.016-11.282l.466-15.142a19.58 19.58 0 0 1 6.562-14.018l.715-.63c7.37-6.527 10.504-16.54 8.18-26.134l-3.371-13.905c-.474-1.951-.171-4.007.844-5.789 2.62-4.578 8.053-13.095 15.02-18.7 1.572-1.26 3.69-1.957 5.968-1.957l26.805 1.295.957.022c8.28 0 15.724-5.263 18.53-13.093l8.343-23.295c1.584-4.427 5.797-7.398 10.481-7.398 1.941 0 3.789.498 5.5 1.482l7.665 4.404c3.18 1.826 7.308 1.64 10.303-.463l40.179-28.161a14.04 14.04 0 0 0 5.38-7.511L464.63 50.736c.84-2.853.317-5.836-1.428-8.185z"/></circle></g>}
                {turnPoints.map((point, i) => <g key={turns[i].n} onClick={(event) => { event.stopPropagation(); setSelected(i); }} style={{ cursor: "pointer" }}><circle cx={point.x} cy={point.y} r={selected === i ? 13 : 9} fill={selected === i ? "#a78bfa" : "#0a0910"} stroke={selected === i ? "#fff" : "#b9a4e8"} strokeWidth="2"/><text x={point.x} y={point.y+3.5} textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff">{turns[i].n}</text></g>)}}
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

        <section style={{ marginTop: 14, border: "1px solid #342740", borderRadius: 18, background: "#100e18", padding: 18 }}>
          <div style={{ color: "#a78bfa", fontSize: 11, letterSpacing: 2, fontWeight: 900 }}>COTA ELEVATION DATA</div>
          <h2 style={{ margin: "8px 0", fontSize: 24 }}>실제 확인 가능한 고도 정보</h2>
          <div style={{ fontSize: 32, fontWeight: 900 }}>+41 m</div>
          <p style={{ color: "#b7b0c2", lineHeight: 1.6, margin: "6px 0 0" }}>스타트/피니시에서 T1까지의 공식 소개 고도 상승량. 이전의 임의 고도 곡선과 지형 폴리곤은 제거했어. 코너별 DEM 표고를 확보하기 전에는 측정하지 않은 높이를 만들어 표시하지 않아.</p>
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
            <p style={{ color: "#777084", fontSize: 11, lineHeight: 1.5, marginBottom: 0 }}>Track outline: F1DB circuit SVG. Turn anchors: published lap distances mapped along the 5.513 km lap. Corner notes are descriptive guidance, not live telemetry.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
