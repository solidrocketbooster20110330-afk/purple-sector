"use client";

import { displayDriverName } from "../../lib/f1Display";
import { getTeamPortraits } from "../../lib/f1Assets";
import Link from "next/link";
import { useEffect, useState } from "react";

type Driver = {
  position: string;
  points: string;
  Driver: { driverId: string; givenName: string; familyName: string; permanentNumber?: string; code?: string; nationality?: string };
  Constructors?: { name: string }[];
};

const colors: Record<string, string> = {
  McLaren: "#ff8000", Ferrari: "#e80020", "Red Bull": "#3671c6", "Red Bull Racing": "#3671c6",
  Mercedes: "#27f4d2", "Aston Martin": "#00665e", Alpine: "#ff87bc", "Alpine F1 Team": "#ff87bc",
  Williams: "#64c4ff", "Racing Bulls": "#6692ff", "Visa Cash App RB": "#6692ff",
  Haas: "#e6002b", "Haas F1 Team": "#e6002b", Audi: "#f50537", Cadillac: "#c9c9c9",
};
const flag: Record<string, string> = { Italian: "🇮🇹", British: "🇬🇧", Dutch: "🇳🇱", Monegasque: "🇲🇨", Spanish: "🇪🇸", Australian: "🇦🇺", French: "🇫🇷", Canadian: "🇨🇦", Japanese: "🇯🇵", Thai: "🇹🇭", German: "🇩🇪", Mexican: "🇲🇽", Brazilian: "🇧🇷", Chinese: "🇨🇳", Finnish: "🇫🇮", Danish: "🇩🇰", American: "🇺🇸" };

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/standings", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load standings");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setDrivers(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <main style={{ minHeight: "100vh", boxSizing: "border-box", padding: "16px 10px 32px", background: "linear-gradient(180deg,#050505,#100b18 70%,#1b1230)", color: "white" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: "12px", margin: "4px 4px 18px" }}>
        <div><div style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 800, letterSpacing: "2px" }}>2026 SEASON</div><h1 style={{ margin: "5px 0 0", fontSize: "30px" }}>드라이버</h1></div>
        <span style={{ color: "#aaa1a4", fontSize: "13px" }}>{drivers.length} DRIVERS</span>
      </div>
      {loading ? <p style={{ color: "#aaa1a4", padding: "18px 4px" }}>드라이버 데이터를 불러오는 중...</p> : error ? <p style={{ color: "#aaa1a4", padding: "18px 4px" }}>데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p> : drivers.length === 0 ? <p style={{ color: "#aaa1a4" }}>표시할 드라이버가 없습니다.</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "8px" }}>
          {drivers.map((driver) => {
            const name = driver.Constructors?.[0]?.name ?? "Unknown Team";
            const color = colors[name] ?? "#7c3aed";
            const fullName = displayDriverName(driver.Driver.givenName, driver.Driver.familyName, driver.Driver.driverId);
            const acronym = driver.Driver.code ?? driver.Driver.givenName.slice(0, 3).toUpperCase();
            const teammates = drivers.filter((candidate) => (candidate.Constructors?.[0]?.name ?? "Unknown Team") === name);
            const teamIndex = teammates.findIndex((candidate) => candidate.Driver.driverId === driver.Driver.driverId);
            const portrait = getTeamPortraits(name)[teamIndex];
            return <Link key={driver.Driver.driverId} href={`/championship/${driver.Driver.driverId}`} style={{ minWidth: 0, overflow: "hidden", background: "linear-gradient(160deg,#111 20%,#080808 65%,#101010)", border: "1px solid #25212b", borderBottom: `3px solid ${color}`, borderRadius: "12px", color: "white", textDecoration: "none" }}>
              <div style={{ position: "relative", height: "190px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "8px", boxSizing: "border-box", background: `radial-gradient(ellipse at 50% 85%, ${color}35, transparent 65%)` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "5px", alignItems: "start", zIndex: 1 }}><strong style={{ fontSize: "26px", lineHeight: 1 }}>{driver.position}</strong><span style={{ fontSize: "11px", fontWeight: 700, color: "#ded8e6", textAlign: "right" }}>{driver.points} pts</span></div>
                <div aria-label={`${fullName} portrait`} style={{ position: "absolute", left: "8px", right: "8px", top: "48px", bottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px", overflow: "hidden", border: `1px solid ${color}66`, background: "#0b0a0e", color: "white", fontSize: "28px", fontWeight: 950 }}>{portrait ? <img src={portrait} alt={fullName} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", padding: "4px", boxSizing: "border-box" }} /> : acronym}</div>
                <span style={{ position: "absolute", bottom: "8px", left: "8px", fontSize: "18px", zIndex: 1 }}>{flag[driver.Driver.nationality ?? ""] ?? "🏁"}</span>
              </div>
              <div style={{ padding: "9px 8px 10px" }}><div style={{ fontSize: "clamp(15px,4vw,18px)", lineHeight: 1.2, fontWeight: 800 }}>{fullName}</div><div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "5px", fontSize: "11px", color: "#d8d1df" }}><span style={{ width: "4px", height: "20px", borderRadius: "4px", background: color, flexShrink: 0 }} /><span style={{ overflowWrap: "anywhere" }}>{name}</span></div></div>
            </Link>;
          })}
        </div>
      )}
    </main>
  );
}
