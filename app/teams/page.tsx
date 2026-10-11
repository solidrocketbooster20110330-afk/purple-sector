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
                  <svg viewBox="0 0 560 250" width="100%" height="auto" role="img" aria-label={`${name} stylized Formula racing car illustration`} style={{ display: "block", minWidth: 0 }}>
                    <defs>
                      <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".65"/><stop offset=".25" stopColor={color}/><stop offset="1" stopColor="#08090d"/></linearGradient>
                      <linearGradient id="tireGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#454650"/><stop offset=".5" stopColor="#08090c"/><stop offset="1" stopColor="#24252b"/></linearGradient>
                    </defs>
                    <ellipse cx="280" cy="197" rx="230" ry="12" fill="#000" opacity=".5"/>
                    <path d="M421 66 L504 63 L510 72 L421 77 Z" fill={color} stroke="#090a0d" strokeWidth="3"/>
                    <path d="M430 75 L433 111 L443 113 L450 76 Z M493 72 L500 111 L510 111 L505 72 Z" fill={color} stroke="#090a0d" strokeWidth="3"/>
                    <circle cx="145" cy="155" r="37" fill="url(#tireGradient)" stroke="#686b75" strokeWidth="3"/>
                    <circle cx="145" cy="155" r="24" fill="#101116" stroke="#a5a9b4" strokeWidth="3"/><circle cx="145" cy="155" r="12" fill={color} stroke="#e5e7eb" strokeWidth="3"/><circle cx="145" cy="155" r="4" fill="#101116"/>
                    <circle cx="414" cy="155" r="37" fill="url(#tireGradient)" stroke="#686b75" strokeWidth="3"/>
                    <circle cx="414" cy="155" r="24" fill="#101116" stroke="#a5a9b4" strokeWidth="3"/><circle cx="414" cy="155" r="12" fill={color} stroke="#e5e7eb" strokeWidth="3"/><circle cx="414" cy="155" r="4" fill="#101116"/>
                    <path d="M35 170 L96 165 L131 168 L131 178 L70 184 L34 180 Z" fill={color} stroke="#08090d" strokeWidth="3"/>
                    <path d="M43 181 L82 180 L104 186 L75 191 L32 188 Z" fill="#11131a" stroke={color} strokeWidth="3"/>
                    <path d="M91 158 L137 142 L194 131 L238 128 L258 143 L210 154 L153 164 L111 169 Z" fill="url(#bodyGradient)" stroke="#08090d" strokeWidth="4" strokeLinejoin="round"/>
                    <path d="M128 153 L184 127 L239 111 L290 109 L336 119 L387 126 L426 143 L419 161 L366 169 L270 170 L184 166 L139 164 Z" fill="url(#bodyGradient)" stroke="#08090d" strokeWidth="4" strokeLinejoin="round"/>
                    <path d="M192 151 L244 143 L287 148 L345 146 L385 153 L365 164 L274 164 L211 160 Z" fill="#f1f5f9" opacity=".94"/>
                    <path d="M150 147 L205 122 L239 114 L268 117 L233 136 L188 151 Z" fill={color} stroke="#08090d" strokeWidth="3"/>
                    <path d="M220 124 L238 91 L267 77 L302 81 L328 108 L311 126 L272 134 Z" fill={color} stroke="#08090d" strokeWidth="4" strokeLinejoin="round"/>
                    <path d="M246 108 L259 91 L282 87 L305 99 L296 116 L270 121 Z" fill="#11131b" stroke="#d8dbe5" strokeWidth="2"/>
                    <path d="M251 106 L263 94 L282 91 L298 100 L290 111 L270 115 Z" fill="#263347"/>
                    <path d="M239 105 C251 79 278 68 301 78 C315 83 326 95 332 109" fill="none" stroke="#dfe3ec" strokeWidth="7" strokeLinecap="round"/>
                    <path d="M239 105 L233 117 M332 109 L339 117" stroke="#aeb4c0" strokeWidth="5" strokeLinecap="round"/>
                    <path d="M263 78 L267 61 L284 53 L302 64 L301 81 L286 87 Z" fill={color} stroke="#08090d" strokeWidth="3"/>
                    <path d="M273 64 L285 59 L296 67 L285 72 Z" fill="#11131b"/>
                    <path d="M145 155 L188 143 M145 155 L189 162 M378 143 L414 155 M379 163 L414 155" stroke="#a8adb8" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M170 169 L270 175 L372 171 L394 176 L364 183 L220 182 L178 177 Z" fill="#08090d" stroke={color} strokeWidth="2"/>
                    <path d="M157 146 L203 130 L225 128 L196 145 Z" fill="#ffffff" opacity=".9"/>
                    <path d="M306 132 L348 135 L369 143 L323 140 Z" fill={name.includes("McLaren") ? "#111827" : "#f1f5f9"} opacity=".9"/>
                    <path d="M431 66 L493 65" stroke="#e5e7eb" strokeWidth="2" opacity=".8"/>
                    <text x="280" y="222" fontSize="12" fontWeight="800" letterSpacing="3" textAnchor="middle" fill="#c8c2d4">{name.toUpperCase()}</text>
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
