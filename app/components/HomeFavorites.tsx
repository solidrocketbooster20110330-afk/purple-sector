"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Driver = {
  points: string;
  Driver: { driverId: string; givenName: string; familyName: string };
};

const STORAGE_KEY = "purple-sector-favorite-drivers";

export default function HomeFavorites() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setFavoriteIds(saved.filter((id): id is string => typeof id === "string"));
    } catch { setFavoriteIds([]); }

    let cancelled = false;
    fetch("/api/championship-data", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (!cancelled && Array.isArray(data?.drivers)) setDrivers(data.drivers); })
      .catch(() => { if (!cancelled) setDrivers([]); });
    return () => { cancelled = true; };
  }, []);

  const favorites = drivers.filter((driver) => favoriteIds.includes(driver.Driver.driverId));
  if (favorites.length === 0) return null;

  return (
    <section style={{ marginBottom: "12px", padding: "13px", borderRadius: "16px", border: "1px solid #39294d", background: "linear-gradient(135deg,#111018,#171020)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "9px" }}>
        <strong style={{ color: "#d7c3ff", fontSize: "13px" }}>★ YOUR DRIVERS</strong>
        <Link href="/favorites" style={{ color: "#a78bfa", fontSize: "12px", textDecoration: "none" }}>Manage →</Link>
      </div>
      <div style={{ display: "grid", gap: "7px" }}>
        {favorites.slice(0, 3).map((driver) => (
          <Link key={driver.Driver.driverId} href={`/championship/${driver.Driver.driverId}`} style={{ display: "flex", justifyContent: "space-between", gap: "8px", padding: "8px 10px", borderRadius: "10px", background: "#0b0a10", color: "white", textDecoration: "none" }}>
            <span>{driver.Driver.givenName} {driver.Driver.familyName}</span>
            <strong style={{ color: "#c4b5fd" }}>{driver.points} pts</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
