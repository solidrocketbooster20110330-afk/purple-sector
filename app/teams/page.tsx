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
                <div style={{ position: "relative", minHeight: "142px", margin: "10px 0 8px", overflow: "hidden", borderRadius: "10px", background: `radial-gradient(ellipse at center,${color}12,#08080a 76%)`, display: "flex", alignItems: "center" }}>
                  <svg viewBox="0 0 620 170" width="100%" height="auto" role="img" aria-label={`${name} monochrome side profile race car`} style={{ display: "block", minWidth: 0 }}>
                    <defs>
                      <linearGradient id={`grey-shell-${team.Constructor.constructorId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f4f5"/><stop offset=".24" stopColor="#bfc0c4"/><stop offset=".7" stopColor="#777980"/><stop offset="1" stopColor="#42434a"/></linearGradient>
                      <linearGradient id={`dark-tyre-${team.Constructor.constructorId}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#292a30"/><stop offset=".5" stopColor="#050506"/><stop offset="1" stopColor="#16171c"/></linearGradient>
                    </defs>
                    <ellipse cx="310" cy="130" rx="258" ry="5" fill="#000" opacity=".45"/>
                    <g strokeLinejoin="round" strokeLinecap="round">
                      {/* Rear tyre, prominent black sidewall and pale hub */}
                      <circle cx="178" cy="104" r="36" fill={`url(#dark-tyre-${team.Constructor.constructorId})`} stroke="#17181c" strokeWidth="2"/>
                      <circle cx="178" cy="104" r="21" fill="#d8d9dc" stroke="#a8a9ad" strokeWidth="1.5"/>
                      <circle cx="178" cy="104" r="5.5" fill="#17181b"/>
                      <path d="M178 84 L178 124 M158 104 L198 104" stroke="#aeb0b4" strokeWidth="1"/>
                      {/* Front tyre */}
                      <circle cx="474" cy="104" r="36" fill={`url(#dark-tyre-${team.Constructor.constructorId})`} stroke="#17181c" strokeWidth="2"/>
                      <circle cx="474" cy="104" r="21" fill="#d8d9dc" stroke="#a8a9ad" strokeWidth="1.5"/>
                      <circle cx="474" cy="104" r="5.5" fill="#17181b"/>
                      <path d="M474 84 L474 124 M454 104 L494 104" stroke="#aeb0b4" strokeWidth="1"/>
                      {/* Rear wing: vertical dark endplate and thin pale top plane */}
                      <path d="M57 35 L73 34 L76 91 L64 96 Z" fill="#17181c"/>
                      <path d="M74 39 L198 40 L198 55 L75 54 Z" fill="#bfc0c4"/>
                      <path d="M76 91 L161 91 L179 94 L179 101 L77 101 Z" fill="#25262b"/>
                      {/* Rear bodywork and engine cover */}
                      <path d="M163 91 L188 78 L250 75 L303 77 L337 84 L358 92 L355 99 L311 102 L260 101 L210 100 L180 101 Z" fill={`url(#grey-shell-${team.Constructor.constructorId})`} stroke="#25262b" strokeWidth="1.5"/>
                      <path d="M195 83 L246 80 L289 82 L268 88 L214 91 Z" fill="#ededee"/>
                      {/* Halo and compact cockpit */}
                      <path d="M296 81 Q324 59 358 74 Q373 80 380 88" fill="none" stroke="#1d1e22" strokeWidth="8"/>
                      <path d="M326 78 L334 66 L355 66 L365 79 L352 85 L331 84 Z" fill="#9b9da2" stroke="#2a2b30" strokeWidth="1.5"/>
                      <path d="M336 70 L353 70 L359 76 L344 78 Z" fill="#56585f"/>
                      <path d="M291 82 L303 74 L326 75 L338 82 L327 87 L302 87 Z" fill="#f0f0f1" stroke="#44464c" strokeWidth="1.3"/>
                      {/* Main chassis: low black upper edge, long sidepod and tapered nose */}
                      <path d="M205 88 L257 83 L298 83 L332 87 L367 88 L397 92 L432 98 L451 102 L474 104 L469 111 L424 112 L380 110 L332 110 L282 109 L233 108 L197 105 Z" fill="#222329" stroke="#111216" strokeWidth="1.5"/>
                      <path d="M246 91 L293 89 L337 91 L383 96 L423 101 L450 105 L423 108 L373 105 L324 103 L279 103 L240 102 Z" fill={`url(#grey-shell-${team.Constructor.constructorId})`} stroke="#66686e" strokeWidth="1"/>
                      <path d="M248 93 L294 91 L337 94 L376 98 L415 103 L389 106 L339 103 L290 102 L241 103 Z" fill="#a9abb0"/>
                      {/* Front nose extends low and flat to the front wing */}
                      <path d="M233 91 L205 91 L176 94 L144 99 L111 101 L91 103 L91 108 L150 108 L198 105 L237 102 Z" fill={`url(#grey-shell-${team.Constructor.constructorId})`} stroke="#34353b" strokeWidth="1.5"/>
                      <path d="M151 99 L192 96 L224 96 L207 101 L167 104 L125 105 Z" fill="#ededee"/>
                      {/* Front wing on the opposite end, thin horizontal blade */}
                      <path d="M31 102 L89 99 L112 101 L112 106 L73 109 L31 108 Z" fill="#bfc0c4" stroke="#202126" strokeWidth="1.5"/>
                      <path d="M34 109 L84 109 L108 112 L64 114 L32 112 Z" fill="#2a2b30" stroke="#777980" strokeWidth="1"/>
                      {/* Floor and lower edge */}
                      <path d="M179 109 L230 112 L286 113 L344 113 L399 114 L429 112 L421 119 L305 120 L224 117 L181 114 Z" fill="#202126"/>
                      <path d="M193 114 L264 117 L345 117 L404 116" fill="none" stroke="#777980" strokeWidth="1.3"/>
                      {/* Front suspension arms */}
                      <path d="M178 104 L211 94 M178 104 L216 111 M474 104 L441 95 M474 104 L441 112" stroke="#aeb0b5" strokeWidth="2"/>
                      {/* Small rearview mirror and clean aerodynamic details */}
                      <path d="M289 84 L281 79 L290 77 L299 82 Z" fill="#d7d8db"/>
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
