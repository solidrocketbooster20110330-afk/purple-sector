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
                  <svg viewBox="0 0 560 250" width="100%" height="auto" role="img" aria-label={`${name} stylized F1 car side profile`} style={{ display: "block", minWidth: 0 }}>
                    <defs>
                      <linearGradient id={`body-${team.Constructor.constructorId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".95"/><stop offset=".3" stopColor={color}/><stop offset="1" stopColor="#171923"/></linearGradient>
                      <linearGradient id={`tyre-${team.Constructor.constructorId}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#454650"/><stop offset=".5" stopColor="#08090c"/><stop offset="1" stopColor="#24252b"/></linearGradient>
                    </defs>
                    <ellipse cx="280" cy="202" rx="230" ry="11" fill="#000" opacity=".5"/>
                    <circle cx="145" cy="157" r="35" fill={`url(#tyre-${team.Constructor.constructorId})`} stroke="#666b76" strokeWidth="3"/>
                    <circle cx="145" cy="157" r="23" fill="#08090d" stroke="#b7bbc5" strokeWidth="3"/><circle cx="145" cy="157" r="12" fill={color} stroke="#e6e8ef" strokeWidth="3"/><circle cx="145" cy="157" r="4" fill="#11131a"/>
                    <circle cx="414" cy="157" r="35" fill={`url(#tyre-${team.Constructor.constructorId})`} stroke="#666b76" strokeWidth="3"/>
                    <circle cx="414" cy="157" r="23" fill="#08090d" stroke="#b7bbc5" strokeWidth="3"/><circle cx="414" cy="157" r="12" fill={color} stroke="#e6e8ef" strokeWidth="3"/><circle cx="414" cy="157" r="4" fill="#11131a"/>
                    <path d="M31 175 L91 170 L131 174 L131 183 L73 188 L31 184 Z" fill={color} stroke="#08090d" strokeWidth="3" strokeLinejoin="round"/>
                    <path d="M39 185 L82 184 L105 190 L75 195 L32 192 Z" fill="#171923" stroke={color} strokeWidth="2.5"/>
                    <path d="M83 165 L128 148 L177 138 L228 133 L254 141 L220 151 L164 163 L111 174 Z" fill={`url(#body-${team.Constructor.constructorId})`} stroke="#08090d" strokeWidth="3" strokeLinejoin="round"/>
                    <path d="M119 158 L166 143 L207 124 L246 116 L286 119 L324 130 L373 136 L414 145 L429 157 L417 168 L360 174 L280 176 L203 171 L150 168 Z" fill={`url(#body-${team.Constructor.constructorId})`} stroke="#08090d" strokeWidth="3.5" strokeLinejoin="round"/>
                    <path d="M164 157 L210 137 L258 133 L295 145 L354 147 L384 156 L357 164 L270 165 L207 163 Z" fill={name.includes("McLaren") ? "#111827" : "#f5f7fb"} opacity=".95"/>
                    <path d="M155 153 L207 132 L236 125 L258 129 L220 148 L183 159 Z" fill={color} stroke="#08090d" strokeWidth="2"/>
                    <path d="M221 132 L234 105 L257 88 L285 87 L312 106 L323 131 L290 143 L254 140 Z" fill={color} stroke="#08090d" strokeWidth="3" strokeLinejoin="round"/>
                    <path d="M245 119 L255 102 L276 96 L299 106 L295 122 L267 129 Z" fill="#11141d" stroke="#c9ceda" strokeWidth="2"/>
                    <path d="M252 117 L262 105 L278 101 L292 108 L286 118 L268 123 Z" fill="#29384e"/>
                    <path d="M237 119 C247 96 267 82 286 86 C302 88 315 102 322 119" fill="none" stroke="#d9dde7" strokeWidth="6" strokeLinecap="round"/>
                    <path d="M237 119 L231 129 M322 119 L330 128" fill="none" stroke="#aeb4c0" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M261 88 L265 70 L281 62 L298 72 L298 89 L283 96 Z" fill={color} stroke="#08090d" strokeWidth="2.5"/>
                    <path d="M270 73 L282 68 L292 75 L282 80 Z" fill="#11141d"/>
                    <path d="M383 144 L414 157 M382 164 L414 157" fill="none" stroke="#aeb4c0" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M408 142 L423 123 L428 83 L439 82 L442 143 Z" fill={color} stroke="#08090d" strokeWidth="2.5" strokeLinejoin="round"/>
                    <path d="M416 75 L503 71 L509 82 L415 86 Z" fill={color} stroke="#08090d" strokeWidth="3" strokeLinejoin="round"/>
                    <path d="M425 79 L495 76" stroke="#f8fafc" strokeWidth="2" opacity=".85"/>
                    <path d="M145 157 L181 146 M145 157 L182 165" fill="none" stroke="#aeb4c0" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M201 169 L280 180 L365 176 L393 180 L361 187 L230 185 L198 178 Z" fill="#090a0f" stroke={color} strokeWidth="2"/>
                    <path d="M183 147 L211 136 L231 136 L207 151 Z" fill="#fff" opacity=".9"/>
                    <path d="M308 139 L345 143 L362 150 L322 147 Z" fill={name.includes("McLaren") ? "#111827" : "#f5f7fb"} opacity=".9"/>
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
