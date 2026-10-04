"use client";

import { useMemo, useState } from "react";

type Point = { round: number; points: number };
type Series = { name: string; points: Point[] };

export default function PointsGraph({ series }: { series: Series[] }) {
  const [selected, setSelected] = useState(series.map((s) => s.name));
  const width = 920;
  const height = 320;
  const pad = { top: 25, right: 20, bottom: 40, left: 48 };
  const visible = series.filter((s) => selected.includes(s.name));
  const maxRound = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.round)));
  const maxPoints = Math.max(10, ...series.flatMap((s) => s.points.map((p) => p.points)));
  const x = (round: number) => pad.left + ((round - 1) / Math.max(1, maxRound - 1)) * (width - pad.left - pad.right);
  const y = (points: number) => height - pad.bottom - (points / maxPoints) * (height - pad.top - pad.bottom);
  const colors = ["#a855f7", "#38bdf8", "#f59e0b", "#22c55e", "#ef4444", "#eab308"];

  return (
    <section style={{ marginTop: 20, background: "#131942", border: "1px solid #2b347a", borderRadius: 18, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>📈 Points Progression</h2>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {series.map((s) => (
            <button key={s.name} onClick={() => setSelected((v) => v.includes(s.name) ? v.filter((n) => n !== s.name) : [...v, s.name])}
              style={{ border: "1px solid #2b347a", background: selected.includes(s.name) ? "#25104d" : "#0d1232", color: "white", borderRadius: 999, padding: "6px 9px", fontSize: 12 }}>
              {s.name}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? <p style={{ color: "#a9adff" }}>드라이버를 하나 이상 선택하세요.</p> : (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", minWidth: 560, height: "auto", display: "block" }} role="img" aria-label="Points progression graph">
            {[0, .25, .5, .75, 1].map((ratio) => (
              <g key={ratio}>
                <line x1={pad.left} x2={width - pad.right} y1={y(maxPoints * ratio)} y2={y(maxPoints * ratio)} stroke="#2b347a" />
                <text x={pad.left - 8} y={y(maxPoints * ratio) + 4} textAnchor="end" fill="#9fa7ff" fontSize="11">{Math.round(maxPoints * ratio)}</text>
              </g>
            ))}
            {visible.map((s, i) => (
              <polyline key={s.name} fill="none" stroke={colors[i % colors.length]} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
                points={s.points.map((p) => `${x(p.round)},${y(p.points)}`).join(" ")} />
            ))}
            {Array.from({ length: maxRound }, (_, i) => i + 1).filter((r) => r === 1 || r === maxRound || r % 3 === 0).map((r) => (
              <text key={r} x={x(r)} y={height - 12} textAnchor="middle" fill="#9fa7ff" fontSize="11">R{r}</text>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}
