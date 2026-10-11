"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Team = { position: string; points: string; Constructor: { constructorId: string; name: string } };
type Driver = { Driver: { driverId: string; givenName: string; familyName: string }; Constructors?: { constructorId?: string; name: string }[] };
type TeamPhoto = { id: string; name: string; imageUrl: string | null; sourceUrl: string | null; credit: string | null; license: string | null; licenseUrl: string | null };

const colors: Record<string, string> = {
  McLaren: "#ff8000", Ferrari: "#e80020", "Red Bull": "#3671c6", "Red Bull Racing": "#3671c6",
  Mercedes: "#27f4d2", "Aston Martin": "#00665e", Alpine: "#ff87bc", "Alpine F1 Team": "#ff87bc",
  Williams: "#64c4ff", "Racing Bulls": "#6692ff", "Visa Cash App RB": "#6692ff",
  Haas: "#e6002b", "Haas F1 Team": "#e6002b", Audi: "#f50537", Cadillac: "#c9c9c9",
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [photos, setPhotos] = useState<TeamPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/constructors", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("Teams"); return r.json(); }),
      fetch("/api/standings", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("Drivers"); return r.json(); }),
      fetch("/api/team-car-photos", { cache: "no-store" }).then((r) => r.ok ? r.json() : []),
    ]).then(([teamData, driverData, photoData]) => {
      if (cancelled) return;
      setTeams(Array.isArray(teamData) ? teamData : []);
      setDrivers(Array.isArray(driverData) ? driverData : []);
      setPhotos(Array.isArray(photoData) ? photoData : []);
    }).catch(() => { if (!cancelled) setError(true); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function photoFor(team: Team) {
    const id = normalize(team.Constructor.constructorId);
    const name = normalize(team.Constructor.name);
    return photos.find((photo) => normalize(photo.id) === id)
      ?? photos.find((photo) => normalize(photo.name) === name)
      ?? photos.find((photo) => normalize(photo.name).includes(name) || name.includes(normalize(photo.name)));
  }

  return (
    <main style={{ minHeight: "100vh", boxSizing: "border-box", padding: "20px 14px 40px", background: "linear-gradient(180deg,#050505,#100b18 70%,#1b1230)", color: "white" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: "12px", margin: "4px 4px 18px" }}>
        <div><div style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 800, letterSpacing: "2px" }}>2026 SEASON</div><h1 style={{ margin: "5px 0 0", fontSize: "30px" }}>컨스트럭터</h1></div>
        <span style={{ color: "#aaa1a4", fontSize: "13px" }}>{teams.length} TEAMS</span>
      </div>
      {loading ? <p style={{ color: "#aaa1a4", padding: "18px 4px" }}>팀 데이터를 불러오는 중...</p> : error ? <p style={{ color: "#aaa1a4", padding: "18px 4px" }}>데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : teams.length === 0 ? <p style={{ color: "#aaa1a4" }}>표시할 팀이 없습니다.</p> : (
        <div style={{ display: "grid", gap: "14px" }}>
          {teams.map((team) => {
            const name = team.Constructor.name;
            const color = colors[name] ?? "#7c3aed";
            const teamDrivers = drivers.filter((driver) => driver.Constructors?.some((c) => c.constructorId === team.Constructor.constructorId || c.name === name));
            const photo = photoFor(team);
            return <article key={team.Constructor.constructorId} style={{ display: "block", padding: "12px", background: `linear-gradient(120deg,${color}12,#090909 55%)`, border: "1px solid #29232f", borderLeft: `4px solid ${color}`, borderRadius: "12px", color: "white" }}>
              <Link href={`/championship/constructors/${team.Constructor.constructorId}`} aria-label={`${name} 팀 상세 보기`} style={{ display: "block", color: "white", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "12px" }}><strong style={{ fontSize: "28px", lineHeight: 1 }}>{team.position}</strong><strong style={{ fontSize: "15px" }}>{team.points} 포인트</strong></div>
                <div style={{ position: "relative", minHeight: "142px", margin: "10px 0 8px", overflow: "hidden", borderRadius: "10px", background: `radial-gradient(ellipse at center,${color}18,#08080a 76%)`, display: "flex", alignItems: "center" }}>
                  <svg viewBox="0 0 620 170" width="100%" height="auto" role="img" aria-label={`${name} monochrome side-view F1 car silhouette`} style={{ display: "block", minWidth: 0 }}>
                    <defs>
                      <linearGradient id={`grey-body-${team.Constructor.constructorId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0f0f0"/><stop offset=".28" stopColor="#b9bbc0"/><stop offset="1" stopColor="#55575d"/></linearGradient>
                      <linearGradient id={`grey-tyre-${team.Constructor.constructorId}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#41434a"/><stop offset=".48" stopColor="#08090c"/><stop offset="1" stopColor="#202127"/></linearGradient>
                    </defs>
                    <ellipse cx="309" cy="130" rx="249" ry="5" fill="#000" opacity=".6"/>
                    <g strokeLinejoin="round" strokeLinecap="round">
                      {/* Two clearly separated, realistic open-wheel tyres */}
                      <circle cx="169" cy="108" r="23" fill={`url(#grey-tyre-${team.Constructor.constructorId})`} stroke="#08090c" strokeWidth="2"/>
                      <circle cx="169" cy="108" r="14" fill="#c6c8cc" stroke="#f0f1f3" strokeWidth="1.4"/>
                      <circle cx="169" cy="108" r="5" fill="#222329"/>
                      <circle cx="438" cy="108" r="23" fill={`url(#grey-tyre-${team.Constructor.constructorId})`} stroke="#08090c" strokeWidth="2"/>
                      <circle cx="438" cy="108" r="14" fill="#c6c8cc" stroke="#f0f1f3" strokeWidth="1.4"/>
                      <circle cx="438" cy="108" r="5" fill="#222329"/>
                      {/* Front wing: layered, narrow and horizontal */}
                      <path d="M39 111 L91 106 L132 106 L151 110 L148 114 L92 117 L40 115 Z" fill="#6e7076" stroke="#17181c" strokeWidth="1.8"/>
                      <path d="M43 117 L98 116 L127 120 L82 122 L42 120 Z" fill="#25262b" stroke="#8a8c91" strokeWidth="1.1"/>
                      {/* Long pointed nose */}
                      <path d="M130 108 L145 98 L181 94 L229 96 L266 101 L249 106 L202 110 L156 113 Z" fill={`url(#grey-body-${team.Constructor.constructorId})`} stroke="#25262b" strokeWidth="1.8"/>
                      <path d="M157 102 L204 97 L238 99 L210 104 L174 108 Z" fill="#dedfe2"/>
                      {/* Main chassis with an engine cover and sidepod shape */}
                      <path d="M184 100 L215 91 L258 89 L291 91 L320 95 L354 97 L386 102 L416 106 L438 111 L420 116 L375 117 L329 115 L279 114 L231 112 L191 110 L178 108 Z" fill={`url(#grey-body-${team.Constructor.constructorId})`} stroke="#202126" strokeWidth="1.8"/>
                      <path d="M222 103 L258 96 L294 97 L331 101 L361 104 L340 109 L289 109 L244 108 Z" fill="#777980" stroke="#e0e1e4" strokeWidth="1"/>
                      <path d="M231 111 L285 112 L347 112 L390 114 L374 119 L300 119 L239 116 Z" fill="#28292f" stroke="#707279" strokeWidth="1"/>
                      {/* Low cockpit and halo */}
                      <path d="M265 96 L276 82 L294 76 L313 79 L330 89 L342 99 L323 103 L291 102 L270 101 Z" fill={`url(#grey-body-${team.Constructor.constructorId})`} stroke="#202126" strokeWidth="1.8"/>
                      <path d="M282 94 L289 84 L303 82 L317 89 L311 96 L292 98 Z" fill="#34363d" stroke="#e2e3e6" strokeWidth="1"/>
                      <path d="M265 95 Q281 73 300 75 Q322 76 342 98" fill="none" stroke="#222329" strokeWidth="4.5"/>
                      <path d="M279 83 L281 74 L294 67 L308 71 L313 82 L301 87 Z" fill="#b9bbc0" stroke="#202126" strokeWidth="1.5"/>
                      <path d="M287 74 L296 71 L304 75 L296 79 Z" fill="#4b4d54"/>
                      {/* Suspension arms */}
                      <path d="M169 108 L202 98 M169 108 L206 115 M438 108 L405 100 M438 108 L404 115" stroke="#b8bac0" strokeWidth="1.7"/>
                      {/* Rear wing and vertical endplate */}
                      <path d="M443 98 L456 88 L460 61 L467 61 L470 103 L454 105 Z" fill="#8e9096" stroke="#202126" strokeWidth="1.7"/>
                      <path d="M450 58 L520 56 L526 63 L451 65 Z" fill="#d5d6da" stroke="#202126" strokeWidth="1.8"/>
                      <path d="M456 59 L517 58" stroke="#777980" strokeWidth="1.2"/>
                      {/* Flat floor and aero edges */}
                      <path d="M200 115 L252 119 L319 120 L382 118 L411 120 L389 124 L277 125 L211 121 Z" fill="#202126" stroke="#777980" strokeWidth="1"/>
                      <path d="M205 101 L226 96 L238 98 L218 104 Z" fill="#f0f0f0"/>
                    </g>
                  </svg>
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: "24px" }}>{name}</h2>
              </Link>
              {photo?.imageUrl && photo.sourceUrl && <div style={{ margin: "-2px 0 8px", color: "#8f8798", fontSize: "10px", lineHeight: 1.4 }}>Photo: <a href={photo.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "#aaa1b4" }}>{photo.credit || "Wikimedia Commons"}</a>{photo.license ? ` · ${photo.license}` : ""}{photo.licenseUrl ? <> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer" style={{ color: "#aaa1b4" }}>License</a></> : null}</div>}
              <div style={{ display: "grid", gap: "0" }}>{teamDrivers.slice(0,2).map((driver,index) => <Link key={driver.Driver.driverId} href={`/championship/${driver.Driver.driverId}`} aria-label={`${driver.Driver.givenName} ${driver.Driver.familyName} 드라이버 상세 보기`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderTop: "1px solid #2a252f", color: "white", textDecoration: "none", borderRadius: "8px" }}><span style={{ width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: `${color}20`, color, fontSize: "11px", fontWeight: 900 }}>{(driver.Driver.givenName[0] + driver.Driver.familyName[0]).toUpperCase()}</span><span style={{ flex: 1, fontWeight: 700 }}>{driver.Driver.driverId === "antonelli" ? "Kimi" : driver.Driver.givenName} {driver.Driver.familyName}</span><span style={{ color: "#aaa1a4", fontSize: "12px" }}>{index + 1}위 ↗</span></Link>)}</div>
            </article>;
          })}
        </div>
      )}
    </main>
  );
}
