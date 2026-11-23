"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Driver = { position: string; points: string; Driver: { driverId: string; givenName: string; familyName: string }; Constructors?: { name: string }[] };
type Constructor = { position: string; points: string; Constructor: { constructorId: string; name: string } };
type Result = { points?: string; Driver?: { driverId?: string }; Constructor?: { constructorId?: string } };
type Race = { round: string; raceName?: string; Results?: Result[]; SprintResults?: Result[] };
type Option = { id: string; name: string; color: string };
type ChartPoint = { round: string; label: string; values: number[] };

const TEAM_COLORS: Record<string, string> = {
  mclaren: "#ff8700", mercedes: "#00d2be", "red bull": "#3671c6", "red bull racing": "#3671c6",
  ferrari: "#e8002d", williams: "#64c4ff", "aston martin": "#229971", alpine: "#ff87bc",
  haas: "#b6babd", "racing bulls": "#6692ff", "visa cash app rb": "#6692ff", audi: "#e30613", cadillac: "#d8d8d8",
};
const PALETTE = ["#a78bfa", "#fb7185", "#38bdf8", "#fbbf24", "#34d399", "#f97316"];
function getTeamColor(name?: string) {
  const normalized = (name ?? "").toLowerCase();
  return Object.entries(TEAM_COLORS).find(([team]) => normalized.includes(team))?.[1] ?? "#a78bfa";
}
const panel = { border: "1px solid #49365f", background: "rgba(20,15,28,0.78)", borderRadius: "15px", padding: "14px", backdropFilter: "blur(14px)" };

export default function ChampionshipComparePage() {
  const [mode, setMode] = useState<"drivers" | "constructors">("drivers");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [constructors, setConstructors] = useState<Constructor[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
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
        const nextRaces = Array.isArray(data?.roundData) ? (data.roundData as (Race | null)[]).filter((race): race is Race => Boolean(race)).sort((a, b) => Number(a.round) - Number(b.round)) : [];
        setDrivers(nextDrivers);
        setConstructors(nextConstructors);
        setRaces(nextRaces);
        setSelected(nextDrivers.slice(0, 2).map((item) => item.Driver.driverId));
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const options: Option[] = mode === "drivers"
    ? drivers.map((item) => ({ id: item.Driver.driverId, name: item.Driver.givenName + " " + item.Driver.familyName, color: getTeamColor(item.Constructors?.[0]?.name) }))
    : constructors.map((item) => ({ id: item.Constructor.constructorId, name: item.Constructor.name, color: getTeamColor(item.Constructor.name) }));

  useEffect(() => {
    if (!options.length) return;
    setSelected((current) => {
      const valid = current.filter((id) => options.some((option) => option.id === id)).slice(0, 6);
      if (valid.length >= 2) return valid;
      return options.slice(0, 2).map((option) => option.id);
    });
  }, [mode, drivers, constructors]);

  const points = useMemo<ChartPoint[]>(() => {
    const totals = selected.map(() => 0);
    return races.map((race) => {
      const allResults = [...(race.Results ?? []), ...(race.SprintResults ?? [])];
      selected.forEach((id, index) => {
        totals[index] += allResults.reduce((sum, result) => {
          const targetId = mode === "drivers" ? result.Driver?.driverId : result.Constructor?.constructorId;
          return sum + (targetId === id ? Number(result.points ?? 0) : 0);
        }, 0);
      });
      return { round: race.round, label: race.raceName ?? "Round " + race.round, values: [...totals] };
    });
  }, [races, mode, selected]);

  const width = Math.max(520, points.length * 40);
  const height = 320;
  const pad = { top: 24, right: 24, bottom: 44, left: 44 };
  const max = Math.max(1, ...points.flatMap((point) => point.values));
  const getX = (index: number) => pad.left + index * (width - pad.left - pad.right) / Math.max(1, points.length - 1);
  const getY = (value: number) => pad.top + (height - pad.top - pad.bottom) * (1 - value / max);
  const linePath = (seriesIndex: number) => points.map((point, index) => (index === 0 ? "M" : "L") + " " + getX(index) + " " + getY(point.values[seriesIndex] ?? 0)).join(" ");
  const selectedOptions = selected.map((id) => options.find((option) => option.id === id)).filter((item): item is Option => Boolean(item));

  function addComparison() {
    const next = options.find((option) => !selected.includes(option.id));
    if (next && selected.length < 6) setSelected((current) => [...current, next.id]);
  }
  function removeComparison(id: string) {
    if (selected.length > 2) setSelected((current) => current.filter((item) => item !== id));
  }
  function changeComparison(index: number, id: string) {
    setSelected((current) => current.map((item, itemIndex) => itemIndex === index ? id : item));
  }

  return (
    <main style={{ minHeight: "100vh", padding: "18px 14px 100px", boxSizing: "border-box", background: "linear-gradient(180deg,#050505,#120c1d 65%,#1b1230)", color: "white" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <Link href="/championship" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "13px" }}>← Championship</Link>
        <h1 style={{ margin: "12px 0 6px" }}>Season Points Comparison</h1>
        <p style={{ margin: "0 0 18px", color: "#aaa1b7", fontSize: "13px" }}>라운드별 누적 포인트 비교 · 스프린트 포인트 포함 · 최대 6명/팀(A~F)</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {(["drivers", "constructors"] as const).map((value) => (
            <button key={value} type="button" onClick={() => { setMode(value); setSelected([]); }} style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "1px solid " + (mode === value ? "#9470d3" : "#32243f"), background: mode === value ? "#30204b" : "#101014", color: "white", fontWeight: 800, cursor: "pointer" }}>{value === "drivers" ? "Drivers" : "Constructors"}</button>
          ))}
        </div>
        <section style={{ ...panel, marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
            <strong>비교 대상 ({selected.length}/6)</strong>
            <button type="button" onClick={addComparison} disabled={selected.length >= 6 || selected.length >= options.length} style={{ border: 0, borderRadius: "10px", padding: "9px 13px", background: selected.length >= 6 || selected.length >= options.length ? "#39313f" : "#6845a0", color: "white", fontWeight: 800, opacity: selected.length >= 6 || selected.length >= options.length ? 0.55 : 1 }}>＋ 추가</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px" }}>
            {selected.map((id, index) => {
              const color = selectedOptions[index]?.color ?? PALETTE[index];
              return (
                <label key={index} style={{ display: "grid", gap: "6px", color, fontSize: "12px", minWidth: 0 }}>
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{String.fromCharCode(65 + index)}</strong>
                    {selected.length > 2 && <button type="button" onClick={() => removeComparison(id)} aria-label="비교 대상 삭제" style={{ border: 0, background: "transparent", color: "#aaa1b7", fontSize: "16px" }}>×</button>}
                  </span>
                  <select value={id} onChange={(event) => changeComparison(index, event.target.value)} style={{ width: "100%", minWidth: 0, padding: "11px 9px", borderRadius: "12px", border: "1px solid #3a2b4d", background: "#101010", color: "white" }}>
                    {options.filter((option) => option.id === id || !selected.includes(option.id)).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                </label>
              );
            })}
          </div>
          {selected.length < 6 && <p style={{ margin: "10px 0 0", color: "#8f849c", fontSize: "11px" }}>최대 6개까지 비교할 수 있어. 같은 대상을 중복 선택할 수 없어.</p>}
        </section>
        {loading ? <p style={{ color: "#aaa1b7" }}>Loading comparison data...</p> : error ? <p style={{ color: "#fda4af" }}>Could not load championship data.</p> : points.length < 2 ? <p style={{ color: "#aaa1b7" }}>Not enough completed rounds to compare yet.</p> : (
          <>
            <section style={{ ...panel, overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px", fontSize: "12px" }}>
                {selectedOptions.map((option, index) => <span key={option.id} style={{ color: option.color, fontWeight: 750 }}>━ {String.fromCharCode(65 + index)} · {option.name} · {points[points.length - 1]?.values[index] ?? 0} pts</span>)}
              </div>
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <svg viewBox={"0 0 " + width + " " + height} width={width} height={height} role="img" aria-label="Cumulative season points comparison" style={{ display: "block" }}>
                  {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                    const value = max * fraction;
                    const y = getY(value);
                    return <g key={fraction}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#392b46" /><text x={pad.left - 8} y={y + 4} textAnchor="end" fill="#aaa1b7" fontSize="10">{Math.round(value)}</text></g>;
                  })}
                  {selectedOptions.map((option, index) => <path key={option.id} d={linePath(index)} fill="none" stroke={option.color || PALETTE[index]} strokeWidth="3" strokeDasharray={index > 0 && selectedOptions.slice(0, index).some((item) => item.color === option.color) ? "7 5" : undefined} strokeLinecap="round" strokeLinejoin="round" />)}
                  {points.map((point, index) => <text key={point.round} x={getX(index)} y={height - 17} textAnchor="middle" fill="#aaa1b7" fontSize="10">R{point.round}</text>)}
                </svg>
              </div>
            </section>
            <section style={panel}>
              <h2 style={{ margin: "0 0 10px", fontSize: "16px" }}>Round breakdown</h2>
              <div style={{ display: "grid", gap: "6px" }}>
                {points.slice().reverse().map((point) => (
                  <div key={point.round} style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr) " + selectedOptions.map(() => "auto").join(" ") , gap: "8px", padding: "8px 0", borderBottom: "1px solid #241d2d", alignItems: "center", fontSize: "12px" }}>
                    <strong>R{point.round}</strong>
                    <span style={{ color: "#b9b0c7", overflowWrap: "anywhere" }}>{point.label}</span>
                    {selectedOptions.map((option, index) => <strong key={option.id} style={{ color: option.color, fontVariantNumeric: "tabular-nums" }}>{point.values[index] ?? 0}</strong>)}
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
