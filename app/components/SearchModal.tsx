"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DriverStanding = {
  Driver: { driverId: string; givenName: string; familyName: string };
  Constructors?: { name: string }[];
};

type ConstructorStanding = {
  Constructor: { constructorId: string; name: string };
};

type Race = {
  round: string;
  raceName: string;
  Circuit?: { Location?: { country?: string } };
};

type SearchItem = {
  type: "driver" | "team" | "race";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords?: string;
};

type SearchModalProps = { onClose: () => void };

export default function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    let cancelled = false;
    async function loadSearchData() {
      try {
        const responses = await Promise.all([
          fetch("/api/standings", { cache: "no-store" }),
          fetch("/api/constructors", { cache: "no-store" }),
          fetch("/api/schedule", { cache: "no-store" }),
        ]);
        if (responses.some((response) => !response.ok)) {
          throw new Error("Search data request failed");
        }

        const [driversData, constructorsData, racesData] = await Promise.all(
          responses.map((response) => response.json())
        );
        if (
          !Array.isArray(driversData) ||
          !Array.isArray(constructorsData) ||
          !Array.isArray(racesData)
        ) {
          throw new Error("Search data has an unexpected format");
        }

        const driverItems: SearchItem[] = (driversData as DriverStanding[])
          .filter((driver) => driver?.Driver?.driverId)
          .map((driver) => {
            const id = driver.Driver.driverId;
            return {
              type: "driver",
              id,
              title: `${driver.Driver.givenName} ${driver.Driver.familyName}`,
              subtitle: driver.Constructors?.[0]?.name ?? "Driver",
              href: `/championship/${id}`,
              keywords: id.replace(/_/g, " "),
            };
          });

        const teamItems: SearchItem[] = (constructorsData as ConstructorStanding[])
          .filter((team) => team?.Constructor?.constructorId)
          .map((team) => {
            const id = team.Constructor.constructorId;
            return {
              type: "team",
              id,
              title: team.Constructor.name,
              subtitle: "Constructor",
              href: `/championship/constructors/${id}`,
              keywords: id.replace(/_/g, " "),
            };
          });

        const raceItems: SearchItem[] = (racesData as Race[])
          .filter((race) => race?.round && race?.raceName)
          .map((race) => ({
            type: "race",
            id: String(race.round),
            title: race.raceName,
            subtitle: `Round ${race.round}${race.Circuit?.Location?.country ? ` · ${race.Circuit.Location.country}` : ""}`,
            href: `/results?round=${race.round}`,
            keywords: `R${race.round} round ${race.round}`,
          }));

        if (!cancelled) {
          setItems([...driverItems, ...teamItems, ...raceItems]);
          setLoadError(false);
        }
      } catch (error) {
        console.error("Search data error:", error);
        if (!cancelled) {
          setItems([]);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSearchData();
    return () => {
      cancelled = true;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchingItems = normalizedQuery
      ? items.filter((item) =>
          `${item.title} ${item.subtitle} ${item.keywords ?? ""}`
            .toLowerCase()
            .includes(normalizedQuery)
        )
      : [...items].sort((a, b) => a.title.localeCompare(b.title));
    return matchingItems.slice(0, 40);
  }, [items, query]);

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
        background: "rgba(0, 0, 0, 0.76)",
        backdropFilter: "blur(4px)",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="purple-sector-search-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(650px, 100%)",
          maxHeight: "min(82vh, 850px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#09090b",
          border: "1px solid #302d35",
          borderRadius: "18px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          color: "#fff",
        }}
      >
        <div style={{ position: "relative", padding: "22px 20px 18px", textAlign: "center", flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="검색 닫기"
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "36px",
              height: "36px",
              border: 0,
              borderRadius: "9px",
              background: "transparent",
              color: "#aaa",
              fontSize: "28px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
          <h2 id="purple-sector-search-title" style={{ margin: "0 36px 12px", fontSize: "25px", fontWeight: 800 }}>검색</h2>
          <p style={{ margin: 0, color: "#aaa5b0", fontSize: "14px", lineHeight: 1.55 }}>
            드라이버, 팀, 그랑프리를 검색하세요.
          </p>
        </div>

        <div style={{ margin: "0 20px", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px", minHeight: "58px", border: "1px solid #302d35", borderRadius: "12px", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#88838e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="드라이버, 팀, 그랑프리 검색..."
            aria-label="검색어"
            style={{ width: "100%", minWidth: 0, border: 0, outline: "none", background: "transparent", color: "#fff", fontSize: "16px" }}
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기" style={{ border: 0, background: "transparent", color: "#aaa", fontSize: "20px", cursor: "pointer" }}>×</button>}
        </div>

        <div style={{ overflowY: "auto", minHeight: "120px", margin: "10px 20px 20px", border: "1px solid #29262e", borderRadius: "12px" }}>
          {loading ? (
            <p style={{ padding: "18px", color: "#aaa5b0", margin: 0 }}>검색 데이터를 불러오는 중...</p>
          ) : loadError ? (
            <p style={{ padding: "18px", color: "#fca5a5", margin: 0 }}>검색 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
          ) : results.length === 0 ? (
            <p style={{ padding: "18px", color: "#aaa5b0", margin: 0 }}>{query.trim() ? "검색 결과가 없습니다." : "표시할 검색 결과가 없습니다."}</p>
          ) : (
            results.map((item, index) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  color: "#f5f3f7",
                  textDecoration: "none",
                  background: index === 0 && !query.trim() ? "#211d25" : "transparent",
                  borderBottom: index === results.length - 1 ? "none" : "1px solid #242128",
                }}
              >
                <span aria-hidden="true" style={{ width: "28px", textAlign: "center", fontSize: "18px", flexShrink: 0 }}>
                  {item.type === "driver" ? "🏎️" : item.type === "team" ? "🏁" : "🏆"}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "15px", fontWeight: 600 }}>{item.title}</span>
                  <span style={{ display: "block", marginTop: "3px", color: "#96919c", fontSize: "12px" }}>{item.subtitle}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
