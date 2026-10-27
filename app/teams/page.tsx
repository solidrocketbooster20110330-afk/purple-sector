"use client";

import { displayDriverName } from "../../lib/f1Display";
import Link from "next/link";
import { useEffect, useState } from "react";

type Team = { position: string; points: string; Constructor: { constructorId: string; name: string } };
type Driver = { Driver: { driverId: string; givenName: string; familyName: string }; Constructors?: { constructorId?: string; name?: string }[] };

const colors: Record<string, string> = {
  McLaren: "#ff8000", Ferrari: "#e80020", "Red Bull": "#3671c6", "Red Bull Racing": "#3671c6",
  Mercedes: "#27f4d2", "Aston Martin": "#00665e", Alpine: "#ff87bc", "Alpine F1 Team": "#ff87bc",
  Williams: "#64c4ff", "Racing Bulls": "#6692ff", "Visa Cash App RB": "#6692ff",
  Haas: "#e6002b", "Haas F1 Team": "#e6002b", Audi: "#f50537", Cadillac: "#c9c9c9",
};


export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/constructors", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("Teams"); return r.json(); }),
      fetch("/api/standings", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("Drivers"); return r.json(); }),
    ]).then(([teamData, driverData]) => {
      if (cancelled) return;
      setTeams(Array.isArray(teamData) ? teamData : []);
      setDrivers(Array.isArray(driverData) ? driverData : []);
    }).catch(() => { if (!cancelled) setError(true); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const rankedTeams = [...teams].sort((a, b) => {
    const positionA = Number.parseInt(a.position, 10);
    const positionB = Number.parseInt(b.position, 10);
    if (Number.isFinite(positionA) && Number.isFinite(positionB)) return positionA - positionB;
    return Number(b.points) - Number(a.points);
  });

  return (
    <main style={{ minHeight: "100vh", boxSizing: "border-box", padding: "20px 14px 40px", background: "linear-gradient(180deg,#050505,#100b18 70%,#1b1230)", color: "white" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: "12px", margin: "4px 4px 18px" }}>
        <div><div style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 800, letterSpacing: "2px" }}>2026 SEASON</div><h1 style={{ margin: "5px 0 0", fontSize: "30px" }}>컨스트럭터</h1></div>
        <span style={{ color: "#aaa1a4", fontSize: "13px" }}>{teams.length} TEAMS</span>
      </div>
      {loading ? <p style={{ color: "#aaa1a4", padding: "18px 4px" }}>팀 데이터를 불러오는 중...</p> : error ? <p style={{ color: "#aaa1a4", padding: "18px 4px" }}>데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : rankedTeams.length === 0 ? <p style={{ color: "#aaa1a4" }}>표시할 팀이 없습니다.</p> : (
        <div style={{ display: "grid", gap: "14px" }}>
          {rankedTeams.map((team) => {
            const name = team.Constructor.name;
            const color = colors[name] ?? "#7c3aed";
            const teamDrivers = drivers.filter((driver) => driver.Constructors?.some((c) => c.constructorId === team.Constructor.constructorId || c.name === name));
            return <article key={team.Constructor.constructorId} style={{ display: "block", padding: "12px", background: `linear-gradient(120deg,${color}12,#090909 55%)`, border: "1px solid #29232f", borderLeft: `4px solid ${color}`, borderRadius: "12px", color: "white" }}>
              <Link href={`/championship/constructors/${team.Constructor.constructorId}`} aria-label={`${name} 팀 상세 보기`} style={{ display: "block", color: "white", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "12px" }}><strong style={{ fontSize: "28px", lineHeight: 1 }}>{team.position}</strong><strong style={{ fontSize: "15px" }}>{team.points} 포인트</strong></div>
                <h2 style={{ margin: "0 0 8px", fontSize: "24px" }}>{name}</h2>
              </Link>
              <div style={{ margin: "8px 0 6px", padding: "9px 0", borderTop: "1px solid #2a252f", borderBottom: "1px solid #2a252f", background: "radial-gradient(ellipse at center, #24202a 0%, #0a090c 75%)", borderRadius: "10px", overflow: "hidden" }}>
                <img src={`/images/teams/${name.toLowerCase().includes("racing bulls") || name.toLowerCase().includes("cash app rb") ? "racing-bulls" : name.toLowerCase().includes("red bull") ? "red-bull" : name.toLowerCase().replace(/ f1 team/g, "").replace(/ /g, "-")}.webp`} alt={`${name} race car`} loading="lazy" style={{ display: "block", width: "100%", height: "auto", maxHeight: "140px", objectFit: "contain" }} onError={(event) => { event.currentTarget.style.display = "none"; }} />
              </div>
              <div style={{ display: "grid", gap: "0" }}>{teamDrivers.slice(0,2).map((driver,index) => {
                const portraitSlug = name.toLowerCase().includes("racing bulls") || name.toLowerCase().includes("cash app rb") ? "racing-bulls" : name.toLowerCase().includes("red bull") ? "red-bull" : name.toLowerCase().replace(/ f1 team/g, "").replace(/ /g, "-");
                const portrait = `/images/drivers/${portraitSlug}-${String(index + 1).padStart(2, "0")}.webp`;
                return <Link key={driver.Driver.driverId} href={`/championship/${driver.Driver.driverId}`} aria-label={`${displayDriverName(driver.Driver.givenName, driver.Driver.familyName, driver.Driver.driverId)} 드라이버 상세 보기`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderTop: "1px solid #2a252f", color: "white", textDecoration: "none", borderRadius: "8px" }}>
                  <span style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", overflow: "hidden", border: `1px solid ${color}`, background: `${color}20`, color, fontSize: "11px", fontWeight: 900 }}>
                    <img src={portrait} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    <span style={{ display: "none" }}>{(driver.Driver.givenName[0] + driver.Driver.familyName[0]).toUpperCase()}</span>
                  </span>
                  <span style={{ flex: 1, fontWeight: 700 }}>{displayDriverName(driver.Driver.givenName, driver.Driver.familyName, driver.Driver.driverId)}</span>
                  <span style={{ color: "#aaa1a4", fontSize: "12px" }}>{index + 1}위 ↗</span>
                </Link>;
              })}</div>
            </article>;
          })}
        </div>
      )}
    </main>
  );
}
