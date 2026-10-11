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
                <div style={{ position: "relative", minHeight: "128px", margin: "10px 0 8px", overflow: "hidden", borderRadius: "10px", background: `radial-gradient(ellipse at center,${color}26,#08080a 76%)`, display: "flex", alignItems: "center" }}>
                  <svg viewBox="0 0 620 150" width="100%" height="auto" role="img" aria-label={`${name} low side-view F1 car illustration`} style={{ display: "block", minWidth: 0 }}>
                    <defs>
                      <linearGradient id={`body-${team.Constructor.constructorId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".95"/><stop offset=".18" stopColor={color}/><stop offset="1" stopColor={color}/></linearGradient>
                      <linearGradient id={`tyre-${team.Constructor.constructorId}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#303139"/><stop offset=".45" stopColor="#08090c"/><stop offset="1" stopColor="#17181e"/></linearGradient>
                    </defs>
                    <ellipse cx="309" cy="119" rx="252" ry="4.5" fill="#000" opacity=".65"/>
                    {/* Flat, long infographic-style silhouette: small wheels and a low chassis */}
                    <g strokeLinejoin="round" strokeLinecap="round">
                      <circle cx="171" cy="101" r="17" fill={`url(#tyre-${team.Constructor.constructorId})`} stroke="#08090c" strokeWidth="2"/>
                      <circle cx="171" cy="101" r="10.5" fill="#111217" stroke="#5b5d65" strokeWidth="1.5"/>
                      <circle cx="171" cy="101" r="3.2" fill={color}/>
                      <circle cx="442" cy="101" r="17" fill={`url(#tyre-${team.Constructor.constructorId})`} stroke="#08090c" strokeWidth="2"/>
                      <circle cx="442" cy="101" r="10.5" fill="#111217" stroke="#5b5d65" strokeWidth="1.5"/>
                      <circle cx="442" cy="101" r="3.2" fill={color}/>
                      {/* Front wing */}
                      <path d="M42 104 L98 100 L133 101 L152 105 L148 109 L99 110 L42 108 Z" fill={color} stroke="#111217" strokeWidth="1.6"/>
                      <path d="M48 110 L102 109 L126 113 L83 115 L44 113 Z" fill="#181920" stroke={color} strokeWidth="1"/>
                      {/* Razor-low nose */}
                      <path d="M96 100 L142 91 L201 89 L237 93 L263 97 L253 101 L195 103 L152 106 L127 105 Z" fill={`url(#body-${team.Constructor.constructorId})`} stroke="#111217" strokeWidth="1.6"/>
                      <path d="M129 96 L161 91 L198 92 L174 98 L143 101 Z" fill={color}/>
                      {/* Sidepod and floor: long horizontal mass, not a tall body */}
                      <path d="M184 94 L222 87 L276 86 L324 89 L365 91 L397 95 L426 99 L442 104 L420 108 L365 108 L307 106 L246 105 L202 103 L174 101 Z" fill={`url(#body-${team.Constructor.constructorId})`} stroke="#111217" strokeWidth="1.7"/>
                      <path d="M221 96 L260 91 L302 92 L342 94 L368 97 L343 101 L286 101 L238 100 Z" fill={name.includes("McLaren") ? "#152033" : "#f7f8fc"}/>
                      <path d="M239 102 L308 103 L368 102 L403 105 L384 109 L297 110 L239 107 Z" fill="#101116" stroke={color} strokeWidth=".9"/>
                      {/* Tiny cockpit and helmet */}
                      <path d="M268 90 L282 76 L308 73 L331 80 L347 92 L333 96 L304 96 L281 95 Z" fill={color} stroke="#111217" strokeWidth="1.7"/>
                      <path d="M285 89 L296 79 L312 79 L326 86 L318 91 L296 92 Z" fill="#11141a"/>
                      <path d="M270 89 Q290 67 313 72 Q331 75 347 92" fill="none" stroke="#d9dde6" strokeWidth="2.7"/>
                      <path d="M279 80 L279 73 L291 65 L306 68 L310 77 L298 82 Z" fill={color} stroke="#111217" strokeWidth="1.5"/>
                      <path d="M286 72 L295 69 L303 73 L295 76 Z" fill="#171923"/>
                      {/* Minimal suspension lines */}
                      <path d="M171 101 L205 92 M171 101 L208 106 M442 101 L409 94 M442 101 L408 106" stroke="#b7bdc9" strokeWidth="1.4"/>
                      {/* Rear wing: thin plate with narrow upright */}
                      <path d="M450 91 L463 80 L466 57 L472 57 L474 97 L458 99 Z" fill={color} stroke="#111217" strokeWidth="1.5"/>
                      <path d="M456 55 L524 53 L530 59 L457 62 Z" fill={color} stroke="#111217" strokeWidth="1.7"/>
                      <path d="M462 56 L521 55" stroke="#fff" strokeWidth="1" opacity=".8"/>
                      {/* Nose/front suspension details */}
                      <path d="M196 105 L235 109 L269 109 L300 111 L363 109 L407 111 L389 114 L255 115 L202 111 Z" fill="#090a0f" stroke={color} strokeWidth="1"/>
                      <path d="M203 94 L224 90 L233 91 L216 97 Z" fill="#fff" opacity=".9"/>
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
