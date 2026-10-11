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
                  <svg viewBox="0 0 560 250" width="100%" height="auto" role="img" aria-label={`${name} original detailed Formula racing car illustration`} style={{ display: "block", minWidth: 0 }}>
                    <defs>
                      <linearGradient id={`body-${team.Constructor.constructorId}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".4"/><stop offset=".22" stopColor={color}/><stop offset=".75" stopColor={color}/><stop offset="1" stopColor="#08090d"/></linearGradient>
                      <linearGradient id={`tire-${team.Constructor.constructorId}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#333640"/><stop offset=".5" stopColor="#050507"/><stop offset="1" stopColor="#24252c"/></linearGradient>
                    </defs>
                    <ellipse cx="282" cy="210" rx="230" ry="13" fill="#000" opacity=".45"/>
                    <path d="M427 64l78-7 9 8-5 9-80 4z" fill={color} stroke="#08090d" strokeWidth="3"/>
                    <path d="M436 69l-5 33 13 3 8-34zM500 64l7 34 11 1-3-34z" fill={color} stroke="#07080a" strokeWidth="2"/>
                    <path d="M408 139c-2-21 7-41 23-44 17-3 29 12 31 36 2 22-6 39-22 41-17 2-29-11-32-33z" fill={`url(#tire-${team.Constructor.constructorId})`} stroke="#555861" strokeWidth="3"/>
                    <path d="M420 141c-1-13 5-25 13-26 10-1 17 8 18 21 1 13-4 23-13 24-9 1-17-7-18-19z" fill="#20232a" stroke="#9ca3af" strokeWidth="2"/>
                    <path d="M47 174l103-8 49 9 0 9-105 8-46-5z" fill={color} stroke="#090a0d" strokeWidth="3"/>
                    <path d="M39 185l-12 14 17 3 28-11zM174 186l30 3 9 11-39-2z" fill="#e5e7eb" stroke="#0b0b0d" strokeWidth="2"/>
                    <path d="M92 150c-1-22 8-39 24-41 17-2 29 15 29 37 0 21-9 37-25 38-16 1-27-13-28-34z" fill={`url(#tire-${team.Constructor.constructorId})`} stroke="#555861" strokeWidth="3"/>
                    <path d="M105 151c0-13 5-23 13-24 10 0 16 10 16 22s-5 22-14 22c-9 0-15-8-15-20z" fill="#20232a" stroke="#9ca3af" strokeWidth="2"/>
                    <path d="M131 146l76-25 91-15 108 17 28 19-13 19-83 9-132-4-56-7z" fill={`url(#body-${team.Constructor.constructorId})`} stroke="#08090d" strokeWidth="3"/>
                    <path d="M193 148l61 5 68-8 72 1-20 17-138 1-48-7z" fill={name.includes("McLaren") ? "#111827" : "#e5e7eb"} opacity=".92"/>
                    <path d="M154 140l49-28 38-14 49 4 26 17-59 5-36 18z" fill={color} stroke="#090a0d" strokeWidth="3"/>
                    <path d="M171 135l46-22 36-7 18 4-27 18z" fill={name.includes("Ferrari") || name.includes("Red Bull") ? "#f8fafc" : "#111827"} opacity=".92"/>
                    <path d="M254 112l18-28 29-9 26 5 15 18-13 18-48 7z" fill="#0b0d13" stroke="#89909c" strokeWidth="2"/>
                    <path d="M275 91l20-10 22 5 11 13-37 6z" fill="#182536" stroke="#cbd5e1" strokeOpacity=".7" strokeWidth="2"/>
                    <path d="M247 103c13-24 39-34 59-29 16 4 26 14 35 29" fill="none" stroke="#d9dce4" strokeWidth="7" strokeLinecap="round"/>
                    <path d="M247 103l-3 13M341 103l7 7" stroke="#a1a6b1" strokeWidth="5" strokeLinecap="round"/>
                    <path d="M282 79l4-18 16-7 18 11-1 16-12 5z" fill={color} stroke="#090a0d" strokeWidth="2"/>
                    <path d="M290 62l12-4 11 9-12 4z" fill="#111827"/>
                    <path d="M208 115l37-10 19 3-29 13zM344 120l38 4 14 8-58-3z" fill={name.includes("Aston") || name.includes("Mercedes") ? "#f8fafc" : "#0b0d13"}/>
                    <path d="M155 145l52-5 24 4-19 6-46 2z" fill="#fff" opacity=".28"/>
                    <path d="M205 163l125 5 79-7" fill="none" stroke="#fff" strokeOpacity=".48" strokeWidth="2"/>
                    <circle cx="118" cy="151" r="8" fill={color} stroke="#e5e7eb" strokeWidth="2"/><circle cx="432" cy="140" r="8" fill={color} stroke="#e5e7eb" strokeWidth="2"/>
                    <circle cx="118" cy="151" r="3" fill="#111827"/><circle cx="432" cy="140" r="3" fill="#111827"/>
                    <path d="M23 203l47-2 7-7 16 3 8 7-60 5zM424 181l65-4 10 7-16 7-49-2z" fill="#050608" stroke={color} strokeWidth="2"/>
                    <text x="300" y="145" fill="#fff" fontSize="17" fontWeight="900" textAnchor="middle">{teamDrivers[0]?.Driver?.permanentNumber ?? ""}</text>
                    <text x="280" y="238" fontSize="12" fontWeight="800" letterSpacing="3" textAnchor="middle" fill="#c8c2d4">{name.toUpperCase()}</text>
                  </svg>
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: "24px" }}>{name}</h2>
              </Link>
              {photo?.imageUrl && photo.sourceUrl && <div style={{ margin: "-2px 0 8px", color: "#8f8798", fontSize: "10px", lineHeight: 1.4 }}>Photo: <a href={photo.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "#aaa1b4" }}>{photo.credit || "Wikimedia Commons"}</a>{photo.license ? ` · ${photo.license}` : ""}{photo.licenseUrl ? <> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer" style={{ color: "#aaa1b4" }}>License</a></> : null}</div>}
              <div style={{ display: "grid", gap: "0" }}>{teamDrivers.slice(0,2).map((driver,index) => <Link key={driver.Driver.driverId} href={`/championship/${driver.Driver.driverId}`} aria-label={`${driver.Driver.givenName} ${driver.Driver.familyName} 드라이버 상세 보기`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderTop: "1px solid #2a252f", color: "white", textDecoration: "none", borderRadius: "8px" }}><span style={{ width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: `${color}20`, color, fontSize: "11px", fontWeight: 900 }}>{(driver.Driver.givenName[0] + driver.Driver.familyName[0]).toUpperCase()}</span><span style={{ flex: 1, fontWeight: 700 }}>{driver.Driver.givenName} {driver.Driver.familyName}</span><span style={{ color: "#aaa1a4", fontSize: "12px" }}>{index + 1}위 ↗</span></Link>)}</div>
            </article>;
          })}
        </div>
      )}
    </main>
  );
}
