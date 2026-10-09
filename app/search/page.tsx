"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";

type DriverStanding = {
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
  };
  Constructors?: { name: string }[];
};

type ConstructorStanding = {
  Constructor: {
    constructorId: string;
    name: string;
  };
};

type Race = {
  round: string;
  raceName: string;
  Circuit?: {
    Location?: {
      country?: string;
    };
  };
};

type SearchItem = {
  type: "driver" | "team" | "race";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords?: string;
};

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
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
            const title = `${driver.Driver.givenName} ${driver.Driver.familyName}`;
            const teamName = driver.Constructors?.[0]?.name ?? "Driver";

            return {
              type: "driver",
              id,
              title,
              subtitle: teamName,
              href: `/championship/${id}`,
              keywords: id.replace(/_/g, " "),
            };
          });

        const teamItems: SearchItem[] = (
          constructorsData as ConstructorStanding[]
        )
          .filter((team) => team?.Constructor?.constructorId)
          .map((team) => {
            const id = team.Constructor.constructorId;
            const title = team.Constructor.name;

            return {
              type: "team",
              id,
              title,
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
            subtitle: `Round ${race.round}${
              race.Circuit?.Location?.country
                ? ` · ${race.Circuit.Location.country}`
                : ""
            }`,
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
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return items
      .filter((item) =>
        `${item.title} ${item.subtitle} ${item.keywords ?? ""}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 20);
  }, [items, query]);

  return (
    <main style={pageStyle}>
      <Link
        href="/"
        style={{
          color: "#ef233c",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        ← Home
      </Link>

      <h1 style={{ fontSize: "34px", margin: "22px 0 6px" }}>🔎 Search</h1>
      <p style={{ color: "#b66b72", marginTop: 0 }}>
        Drivers, teams, and Grands Prix
      </p>

      <div
        style={{
          background: "#111111",
          border: "1px solid #3a171b",
          borderRadius: "18px",
          padding: "14px 16px",
          marginTop: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search driver, team, or GP..."
          aria-label="Search"
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "white",
            fontSize: "17px",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "18px",
          background: "#111111",
          border: "1px solid #3a171b",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {!query.trim() ? (
          <div style={{ padding: "20px", color: "#b66b72" }}>
            {loading
              ? "검색 데이터를 불러오는 중..."
              : "검색어를 입력해 주세요."}
          </div>
        ) : loading ? (
          <div style={{ padding: "20px", color: "#b66b72" }}>
            검색 데이터를 불러오는 중...
          </div>
        ) : loadError ? (
          <div style={{ padding: "20px", color: "#b66b72" }}>
            검색 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: "20px", color: "#b66b72" }}>
            검색 결과가 없습니다.
          </div>
        ) : (
          results.map((item, index) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              style={{
                display: "block",
                color: "white",
                textDecoration: "none",
                padding: "15px 18px",
                borderBottom:
                  index === results.length - 1
                    ? "none"
                    : "1px solid #3a171b",
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {item.type === "driver"
                  ? "👤"
                  : item.type === "team"
                    ? "🏭"
                    : "🏁"}{" "}
                {item.title}
              </div>
              <div
                style={{
                  color: "#b66b72",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {item.subtitle}
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
