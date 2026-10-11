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
                <div style={{ position: "relative", minHeight: "174px", margin: "10px 0 8px", overflow: "hidden", borderRadius: "10px", background: `radial-gradient(ellipse at center,${color}35,#08080a 74%)`, display: "flex", alignItems: "center" }}>
                  <svg viewBox="0 0 560 220" width="100%" height="auto" role="img" aria-label={`${name} side-view F1 car illustration`} style={{ display: "block", minWidth: 0 }}>
                    <defs>
                      <linearGradient id={`paint-${team.Constructor.constructorId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".95"/><stop offset=".32" stopColor={color}/><stop offset="1" stopColor={color}/></linearGradient>
                      <linearGradient id={`rubber-${team.Constructor.constructorId}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#555862"/><stop offset=".42" stopColor="#08090c"/><stop offset="1" stopColor="#24252b"/></linearGradient>
                    </defs>
                    <ellipse cx="285" cy="178" rx="222" ry="8" fill="#000" opacity=".5"/>
                    {/* Compact, low side-profile tyres */}
                    <circle cx="171" cy="139" r="25" fill={`url(#rubber-${team.Constructor.constructorId})`} stroke="#777b85" strokeWidth="2.5"/>
                    <circle cx="171" cy="139" r="16" fill="#090a0e" stroke="#d1d5db" strokeWidth="2"/>
                    <circle cx="171" cy="139" r="7" fill={color} stroke="#e5e7eb" strokeWidth="2"/>
                    <circle cx="171" cy="139" r="2.5" fill="#11131a"/>
                    <circle cx="401" cy="139" r="25" fill={`url(#rubber-${team.Constructor.constructorId})`} stroke="#777b85" strokeWidth="2.5"/>
                    <circle cx="401" cy="139" r="16" fill="#090a0e" stroke="#d1d5db" strokeWidth="2"/>
                    <circle cx="401" cy="139" r="7" fill={color} stroke="#e5e7eb" strokeWidth="2"/>
                    <circle cx="401" cy="139" r="2.5" fill="#11131a"/>
                    {/* Front wing and long, low nose */}
                    <path d="M70 148 L121 145 L151 147 L151 153 L103 157 L68 155 Z" fill={color} stroke="#101116" strokeWidth="2.5" strokeLinejoin="round"/>
                    <path d="M78 157 L118 155 L136 160 L104 164 L70 162 Z" fill="#11131a" stroke={color} strokeWidth="2"/>
                    <path d="M105 143 L151 129 L203 124 L239 128 L226 137 L177 143 L140 149 Z" fill={`url(#paint-${team.Constructor.constructorId})`} stroke="#111116" strokeWidth="2.5" strokeLinejoin="round"/>
                    {/* Main chassis / sidepod silhouette */}
                    <path d="M145 134 L192 121 L236 119 L273 123 L309 128 L350 129 L385 136 L405 142 L395 149 L347 153 L275 153 L219 150 L174 147 Z" fill={`url(#paint-${team.Constructor.constructorId})`} stroke="#111116" strokeWidth="2.5" strokeLinejoin="round"/>
                    {/* Thin sidepod highlight, like the reference illustration */}
                    <path d="M199 137 L238 129 L274 132 L315 135 L348 137 L365 142 L334 146 L263 145 L218 143 Z" fill={name.includes("McLaren") ? "#111827" : "#f7f8fc"} opacity=".95"/>
                    <path d="M157 135 L203 123 L226 123 L197 137 L174 142 Z" fill={color} stroke="#111116" strokeWidth="1.5"/>
                    {/* Low cockpit with visible halo and small helmet */}
                    <path d="M237 125 L246 105 L265 94 L286 96 L304 110 L312 128 L286 134 L257 132 Z" fill={color} stroke="#111116" strokeWidth="2.5" strokeLinejoin="round"/>
                    <path d="M252 119 L262 105 L278 102 L294 110 L289 121 L270 125 Z" fill="#11141d" stroke="#d9dde7" strokeWidth="1.5"/>
                    <path d="M238 119 C249 99 265 91 281 95 C296 97 306 108 313 122" fill="none" stroke="#dfe3ec" strokeWidth="4.5" strokeLinecap="round"/>
                    <path d="M238 119 L234 127 M313 122 L319 128" fill="none" stroke="#aeb4c0" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M263 96 L266 83 L279 77 L293 84 L293 97 L280 102 Z" fill={color} stroke="#111116" strokeWidth="2"/>
                    <path d="M271 84 L280 80 L288 85 L280 89 Z" fill="#11141d"/>
                    {/* Rear suspension and a thin, raised rear wing */}
                    <path d="M374 132 L401 139 M374 147 L401 139" stroke="#c2c7d2" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M398 125 L412 108 L416 75 L423 75 L425 132 Z" fill={color} stroke="#111116" strokeWidth="2"/>
                    <path d="M402 69 L481 66 L486 74 L401 78 Z" fill={color} stroke="#111116" strokeWidth="2.5" strokeLinejoin="round"/>
                    <path d="M410 71 L476 69" stroke="#fff" strokeWidth="1.5" opacity=".85"/>
                    {/* Front suspension and floor */}
                    <path d="M171 139 L202 130 M171 139 L204 147" stroke="#c2c7d2" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M195 151 L273 158 L350 154 L371 158 L346 163 L228 162 L195 156 Z" fill="#090a0f" stroke={color} strokeWidth="1.5"/>
                    <path d="M204 132 L231 127 L243 129 L220 137 Z" fill="#fff" opacity=".92"/>
                    <path d="M313 130 L341 132 L355 137 L324 135 Z" fill={name.includes("McLaren") ? "#111827" : "#f7f8fc"} opacity=".9"/>
                    <text x="280" y="193" fontSize="11" fontWeight="800" letterSpacing="3" textAnchor="middle" fill="#c8c2d4">{name.toUpperCase()}</text>
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
