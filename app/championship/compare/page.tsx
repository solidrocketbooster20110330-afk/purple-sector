"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Driver = { position: string; points: string; Driver: { driverId: string; givenName: string; familyName: string }; Constructors?: { name: string }[] };
type Constructor = { position: string; points: string; Constructor: { constructorId: string; name: string } };
type Result = { points?: string; Driver?: { driverId?: string }; Constructor?: { constructorId?: string } };
type Race = { round: string; raceName?: string; Results?: Result[]; SprintResults?: Result[] };
type SeriesPoint = { round: string; label: string; a: number; b: number };

const colors = ["#a78bfa", "#fb7185"];
const panel = { border: "1px solid #32243f", background: "#101014", borderRadius: "15px", padding: "14px" };

export default function ChampionshipComparePage() {
  const [mode, setMode] = useState<"drivers" | "constructors">("drivers");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [constructors, setConstructors] = useState<Constructor[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/championship-data", { cache: "no-store" })
      .then(async (res) => { if (!res.ok) throw new Error("Championship data unavailable"); return res.json(); })
      .then((data) => {
        if (cancelled) return;
        const nextDrivers = Array.isArray(data?.drivers) ? data.drivers as Driver[] : [];
        const nextConstructors = Array.isArray(data?.constructors) ? data.constructors as Constructor[] : [];
        const nextRaces = Array.isArray(data?.roundData) ? (data.roundData as (Race | null)[]).filter((race): race is Race => Boolean(race)).sort((a,b) => Number(a.round)-Number(b.round)) : [];
        setDrivers(nextDrivers);
        setConstructors(nextConstructors);
        setRaces(nextRaces);
        setFirst(nextDrivers[0]?.Driver.driverId ?? "");
        setSecond(nextDrivers[1]?.Driver.driverId ?? nextDrivers[0]?.Driver.driverId ?? "");
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const options = mode === "drivers"
    ? drivers.map((item) => ({ id: item.Driver.driverId, name: `${item.Driver.givenName} ${item.Driver.familyName}` }))
    : constructors.map((item) => ({ id: item.Constructor.constructorId, name: item.Constructor.name }));

  useEffect(() => {
    const ids = options.map((item) => item.id);
    if (!ids.length) return;
    if (!ids.includes(first)) setFirst(ids[0]);
    if (!ids.includes(second)) setSecond(ids[Math.min(1, ids.length - 1)]);
  }, [mode, drivers, constructors]); // Re-align choices when comparison mode changes.

  const points = useMemo<SeriesPoint[]>(() => {
    let a = 0;
    let b = 0;
    return races.map((race) => {
      const allResults = [...(race.Results ?? []), ...(race.SprintResults ?? [])];
      const earned = (id: string) => allResults.reduce((sum, result) => {
        const targetId = mode === "drivers" ? result.Driver?.driverId : result.Constructor?.constructorId;
        return sum + (targetId === id ? Number(result.points ?? 0) : 0);
      }, 0);
      a += earned(first);
      b += earned(second);
      return { round: race.round, label: race.raceName ?? `Round ${race.round}`, a, b };
    });
  }, [races, mode, first, second]);

  const width = Math.max(520, points.length * 40);
  const height = 300;
  const pad = { top: 24, right: 28, bottom: 44, left: 44 };
  const max = Math.max(1, ...points.flatMap((point) => [point.a, point.b]));
  const getX = (index: number) => pad.left + index * (width - pad.left - pad.right) / Math.max(1, points.length - 1);
  const getY = (value: number) => pad.top + (height - pad.top - pad.bottom) * (1 - value / max);
  const pathFor = (key: "a" | "b") => points.map((point, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point[key])}`).join(" ");
  const titleFor = (id: string) => options.find((option) => option.id === id)?.name ?? "Select";

  return (
    <main style={{ minHeight: "100vh", padding: "18px 14px 100px", boxSizing: "border-box", background: "linear-gradient(180deg,#050505,#120c1d 65%,#1b1230)", color: "white" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <Link href="/championship" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "13px" }}>← Championship</Link>
        <h1 style={{ margin: "12px 0 6px" }}>Season Points Comparison</h1>
        <p style={{ margin: "0 0 18px", color: "#aaa1b7", fontSize: "13px" }}>Round-by-round cumulative points, including sprint points.</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {(["drivers", "constructors"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setMode(value)} style={{ flex: 1, padding: "11px", borderRadius: "12px", border: `1px solid ${mode === value ? "#9470d3" : "#32243f"}`, background: mode === value ? "#30204b" : "#101014", color: "white", fontWeight: 800, cursor: "pointer" }}>{value === "drivers" ? "Drivers" : "Constructors"}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px", marginBottom: "14px" }}>
          {[{ value: first, set: setFirst, label: "Compare A" }, { value: second, set: setSecond, label: "Compare B" }].map((item) => (
            <label key={item.label} style={{ display: "grid", gap: "6px", color: "#aaa1b7", fontSize: "12px" }}>
              {item.label}
              <select value={item.value} onChange={(event) => item.set(event.target.value)} style={{ width: "100%", minWidth: 0, padding: "11px 9px", borderRadius: "12px", border: "1px solid #3a2b4d", background: "#101010", color: "white" }}>
                {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
              </select>
            </label>
          ))}
        </div>
        {loading ? <p style={{ color: "#aaa1b7" }}>Loading comparison data...</p> : error ? <p style={{ color: "#fda4af" }}>Could not load championship data.</p> : points.length < 2 ? <p style={{ color: "#aaa1b7" }}>Not enough completed rounds to compare yet.</p> : (
          <>
            <section style={{ ...panel, overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "12px", fontSize: "13px" }}>
                <span style={{ color: colors[0] }}>━ {titleFor(first)} · {points[points.length - 1]?.a ?? 0} pts</span>
                <span style={{ color: colors[1] }}>━ {titleFor(second)} · {points[points.length - 1]?.b ?? 0} pts</span>
              </div>
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label="Cumulative season points comparison" style={{ display: "block" }}>
                  {[0,0.25,0.5,0.75,1].map((fraction) => {
                    const value = max * fraction;
                    const y = getY(value);
                    return <g key={fraction}><line x1={pad.left} x2={width-pad.right} y1={y} y2={y} stroke="#392b46"/><text x={pad.left-8} y={y+4} textAnchor="end" fill="#aaa1b7" fontSize="10">{Math.round(value)}</text></g>;
                  })}
                  <path d={pathFor("a")} fill="none" stroke={colors[0]} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d={pathFor("b")} fill="none" stroke={colors[1]} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {points.map((point,index) => <text key={point.round} x={getX(index)} y={height-17} textAnchor="middle" fill="#aaa1b7" fontSize="10">R{point.round}</text>)}
                </svg>
              </div>
            </section>
            <section style={panel}>
              <h2 style={{ margin: "0 0 10px", fontSize: "16px" }}>Round breakdown</h2>
              <div style={{ display: "grid", gap: "6px" }}>
                {points.slice().reverse().map((point) => (
                  <div key={point.round} style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1fr) auto auto", gap: "9px", padding: "8px 0", borderBottom: "1px solid #241d2d", alignItems: "center", fontSize: "13px" }}>
                    <strong>R{point.round}</strong><span style={{ color: "#b9b0c7", overflowWrap: "anywhere" }}>{point.label}</span><strong style={{ color: colors[0] }}>{point.a}</strong><strong style={{ color: colors[1] }}>{point.b}</strong>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
