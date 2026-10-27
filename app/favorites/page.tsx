"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Driver = {
  position: string;
  points: string;
  Driver: { driverId: string; givenName: string; familyName: string; permanentNumber?: string };
  Constructors?: { name: string }[];
};

const STORAGE_KEY = "purple-sector-favorite-drivers";
const panel = { border: "1px solid #32243f", background: "#101014", borderRadius: "15px", padding: "13px" };

export default function FavoritesPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setFavoriteIds(saved.filter((id): id is string => typeof id === "string"));
    } catch { setFavoriteIds([]); }
    let cancelled = false;
    fetch("/api/championship-data", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (!cancelled) setDrivers(Array.isArray(data?.drivers) ? data.drivers : []); })
      .catch(() => { if (!cancelled) setDrivers([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const persist = (ids: string[]) => {
    setFavoriteIds(ids);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch { /* storage may be unavailable */ }
  };
  const toggle = (id: string) => persist(favoriteIds.includes(id) ? favoriteIds.filter((item) => item !== id) : [...favoriteIds, id]);
  const filtered = useMemo(() => drivers.filter((driver) => {
    const name = `${driver.Driver.givenName} ${driver.Driver.familyName} ${driver.Constructors?.[0]?.name ?? ""}`.toLowerCase();
    return name.includes(search.trim().toLowerCase());
  }), [drivers, search]);
  const sorted = [...filtered].sort((a, b) => Number(a.position) - Number(b.position));

  return (
    <main style={{ minHeight: "100vh", padding: "18px 14px 100px", boxSizing: "border-box", background: "linear-gradient(180deg,#050505,#120c1d 65%,#1b1230)", color: "white" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <Link href="/championship" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "13px" }}>← Championship</Link>
        <h1 style={{ margin: "12px 0 6px" }}>★ Favorite Drivers</h1>
        <p style={{ margin: "0 0 16px", color: "#aaa1b7", fontSize: "13px" }}>Favorites are saved on this device and stay selected after refresh.</p>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search driver or team..." aria-label="Search drivers" style={{ width: "100%", boxSizing: "border-box", marginBottom: "12px", padding: "12px", borderRadius: "12px", border: "1px solid #3a2b4d", background: "#101010", color: "white" }} />
        {loading ? <p style={{ color: "#aaa1b7" }}>Loading drivers...</p> : (
          <div style={{ display: "grid", gap: "9px" }}>
            {sorted.map((driver) => {
              const id = driver.Driver.driverId;
              const favorite = favoriteIds.includes(id);
              const team = driver.Constructors?.[0]?.name ?? "Team not listed";
              return (
                <div key={id} style={{ ...panel, display: "grid", gridTemplateColumns: "44px minmax(0,1fr) auto", gap: "10px", alignItems: "center", borderColor: favorite ? "#7854b8" : "#32243f" }}>
                  <div style={{ fontSize: "13px", fontWeight: 900, color: "#c4b5fd" }}>P{driver.position}</div>
                  <Link href={`/championship/${id}`} style={{ minWidth: 0, color: "white", textDecoration: "none" }}>
                    <div style={{ fontWeight: 800, overflowWrap: "anywhere" }}>{driver.Driver.givenName} {driver.Driver.familyName}</div>
                    <div style={{ marginTop: "3px", color: "#a8a1b4", fontSize: "12px" }}>{team} · {driver.points} pts</div>
                  </Link>
                  <button type="button" onClick={() => toggle(id)} aria-pressed={favorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid #574071", color: favorite ? "#e9d5ff" : "#aea4bf", background: favorite ? "#39214f" : "#17131c", fontSize: "20px", cursor: "pointer" }}>{favorite ? "★" : "☆"}</button>
                </div>
              );
            })}
            {sorted.length === 0 && <p style={{ color: "#aaa1b7" }}>No drivers match that search.</p>}
          </div>
        )}
      </div>
    </main>
  );
}
