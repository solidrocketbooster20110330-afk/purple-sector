"use client";

import Link from "next/link";
import BottomNav from "../components/BottomNav";
import ResultsTabs from "./ResultsTabs";
import { useEffect, useState } from "react";
import {
  fetchGrandPrix,
  getGrandPrixByRound,
  getLatestGrandPrix,
  getRelevantGrandPrix,
  storeGrandPrix,
  type GrandPrix,
} from "../../lib/grandPrix";

type RaceResult = {
  number: string;
  position: string;
  grid: string;
  points: string;
  status: string;
  Time?: { time: string };
  FastestLap?: {
    rank?: string;
    lap?: string;
    Time?: { time: string };
    AverageSpeed?: { units: string; speed: string };
  };
  Driver: { driverId?: string; givenName: string; familyName: string };
  Constructor: { constructorId?: string; name: string };
};

type GrandPrixWithCircuit = GrandPrix & {
  Circuit?: GrandPrix["Circuit"];
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
  color: "white",
  padding: "20px",
  paddingBottom: "90px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#111111",
  border: "1px solid #3a171b",
  borderRadius: "20px",
  padding: "20px",
  overflowX: "auto" as const,
};

const headers = ["POS", "NO", "DRIVER", "TEAM", "GRID", "STATUS", "PTS"];

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

function getStatusText(result: RaceResult) {
  if (result.status.includes("Lap")) {
    const laps = result.status.match(/\d+/)?.[0] ?? "1";
    return `+${laps} Lap`;
  }

  if (result.status === "Finished") {
    return result.Time?.time ?? "Finished";
  }

  return "DNF";
}

const teamColors: Record<string, string> = {
  McLaren: "#ff8000",
  Ferrari: "#e80020",
  "Red Bull": "#3671c6",
  "Red Bull Racing": "#3671c6",
  "Red Bull Racing F1 Team": "#3671c6",
  Mercedes: "#27f4d2",
  "Aston Martin": "#00665e",
  "Aston Martin F1 Team": "#00665e",
  "Alpine F1 Team": "#ff87bc",
  Alpine: "#ff87bc",
  Williams: "#64c4ff",
  "Racing Bulls": "#6692ff",
  "Visa Cash App RB": "#6692ff",
  "Visa Cash App Racing Bulls": "#6692ff",
  "RB F1 Team": "#6692ff",
  RB: "#6692ff",
  "Haas F1 Team": "#e6002b",
  Haas: "#e6002b",
  Audi: "#f50537",
  "Cadillac F1 Team": "#c9c9c9",
  Cadillac: "#c9c9c9",
};

function teamInitials(name: string) {
  const words = name
    .replace(/F1 Team|F1|Racing|Team|Formula One/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function teamBadge(name: string) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    marginRight: "8px",
    borderRadius: "50%",
    background: teamColors[name] ?? "#5c5c5c",
    color: "#050505",
    fontSize: "11px",
    fontWeight: "900",
    flexShrink: 0,
  } as const;
}

function countryFlag(country?: string) {
  const flags: Record<string, string> = {
    Australia: "🇦🇺",
    China: "🇨🇳",
    Japan: "🇯🇵",
    Canada: "🇨🇦",
    Monaco: "🇲🇨",
    Austria: "🇦🇹",
    UnitedKingdom: "🇬🇧",
    Belgium: "🇧🇪",
    Hungary: "🇭🇺",
    Netherlands: "🇳🇱",
    Italy: "🇮🇹",
    Azerbaijan: "🇦🇿",
    Singapore: "🇸🇬",
    UnitedStates: "🇺🇸",
    Mexico: "🇲🇽",
    Brazil: "🇧🇷",
    Qatar: "🇶🇦",
    "United Arab Emirates": "🇦🇪",
    Spain: "🇪🇸",
    Bahrain: "🇧🇭",
    Germany: "🇩🇪",
  };

  if (!country) return "🌍";
  return flags[country] ?? flags[country.replace(/\s+/g, "")] ?? "🌍";
}

function getFastestLap(results: RaceResult[]) {
  return (
    results
      .filter((result) => result.FastestLap?.Time?.time)
      .sort(
        (a, b) =>
          Number(a.FastestLap?.rank ?? "999") -
          Number(b.FastestLap?.rank ?? "999")
      )[0] ?? null
  );
}

export default function ResultsPage() {
  const [races, setRaces] = useState<GrandPrix[]>([]);
  const [selectedRace, setSelectedRace] =
    useState<GrandPrixWithCircuit | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrandPrix()
      .then((items) => {
        setRaces(items);
        const queryRound = new URLSearchParams(window.location.search).get(
          "round"
        );
        const selected =
          getGrandPrixByRound(items, queryRound) ??
          getRelevantGrandPrix(items) ??
          getLatestGrandPrix(items);
        setSelectedRace(selected);
        if (selected) storeGrandPrix(selected.round);
      })
      .catch(() => setRaces([]))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedRace) return;

    setResults([]);

    fetch(
      `https://api.jolpi.ca/ergast/f1/${selectedRace.season}/${selectedRace.round}/results.json`,
      { cache: "no-store" }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setResults(data?.MRData?.RaceTable?.Races?.[0]?.Results ?? []);
      });
  }, [selectedRace]);

  const fastestLap = getFastestLap(results);
  const selectedCountry = selectedRace?.Circuit?.Location?.country;

  return (
    <main style={pageStyle}>
      <h1 style={{ marginBottom: "6px" }}>🏁 Results</h1>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: 0,
            border: 0,
            background: "transparent",
            color: "#ef233c",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          <span>
            {countryFlag(selectedCountry)}{" "}
            {selectedRace?.raceName ?? (loading ? "Loading..." : "Grand Prix")}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "#b66b72",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.15s ease",
            }}
          >
            ▼
          </span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "36px",
              left: 0,
              right: 0,
              zIndex: 20,
              background: "#111111",
              border: "1px solid #3a171b",
              borderRadius: "14px",
              padding: "8px",
              maxHeight: "320px",
              overflowY: "auto",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
            }}
          >
            {races
              .slice()
              .reverse()
              .map((race) => {
                const active = selectedRace?.round === race.round;
                return (
                  <button
                    key={`${race.season}-${race.round}`}
                    type="button"
                    onClick={() => {
                      storeGrandPrix(race.round);
                      window.location.href = `/results?round=${race.round}`;
                    }}
                    style={{
                      width: "100%",
                      display: "block",
                      textAlign: "left",
                      padding: "10px 12px",
                      marginBottom: "4px",
                      border: 0,
                      borderRadius: "10px",
                      background: active ? "#c4162a" : "transparent",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {countryFlag(race.Circuit?.Location?.country)}{" "}
                    {race.raceName}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      <ResultsTabs />

      {fastestLap && (
        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#ef233c",
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing: "0.08em",
              }}
            >
              ⚡ FASTEST LAP
            </div>
            <div
              style={{ fontSize: "20px", fontWeight: "bold", marginTop: "5px" }}
            >
              {fastestLap.Driver.givenName} {fastestLap.Driver.familyName}
            </div>
            <div style={{ color: "#b66b72", marginTop: "4px" }}>
              Lap {fastestLap.FastestLap?.lap ?? "-"}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {fastestLap.FastestLap?.Time?.time}
            </div>
            {fastestLap.FastestLap?.AverageSpeed && (
              <div
                style={{
                  color: "#b66b72",
                  marginTop: "4px",
                  fontSize: "13px",
                }}
              >
                {fastestLap.FastestLap.AverageSpeed.speed}{" "}
                {fastestLap.FastestLap.AverageSpeed.units}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={cardStyle}>
        {results.length === 0 ? (
          <p>{loading ? "결과를 불러오는 중..." : "Race 데이터 없음"}</p>
        ) : (
          <table
            style={{
              width: "100%",
              minWidth: "760px",
              tableLayout: "fixed",
              borderCollapse: "collapse",
            }}
          >
            <colgroup>
              <col style={{ width: "60px" }} />
              <col style={{ width: "60px" }} />
              <col style={{ width: "190px" }} />
              <col style={{ width: "175px" }} />
              <col style={{ width: "70px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "60px" }} />
            </colgroup>

            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "12px 8px",
                      color: "#ef233c",
                      borderBottom: "2px solid #3a171b",
                      whiteSpace: "nowrap",
                      textAlign:
                        header === "DRIVER" || header === "TEAM"
                          ? "left"
                          : "center",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {results.map((driver) => {
                const statusText = getStatusText(driver);

                return (
                  <tr key={driver.position}>
                    <td
                      style={{
                        padding: "11px 7px",
                        textAlign: "center",
                        fontWeight: "bold",
                        borderBottom: "1px solid #3a171b",
                      }}
                    >
                      {positionLabel(driver.position)}
                    </td>
                    <td
                      style={{
                        padding: "14px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                        borderBottom: "1px solid #3a171b",
                      }}
                    >
                      #{driver.number}
                    </td>
                    <td
                      style={{
                        padding: "14px 8px",
                        borderBottom: "1px solid #3a171b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Link href={`/championship/${driver.Driver.driverId ?? ""}`} style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>{driver.Driver.givenName} {driver.Driver.familyName}</Link>
                    </td>
                    <td
                      style={{
                        padding: "14px 8px",
                        borderBottom: "1px solid #3a171b",
                        whiteSpace: "normal",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          maxWidth: "100%",
                        }}
                      >
                        <span style={teamBadge(driver.Constructor.name)}>
                          {teamInitials(driver.Constructor.name)}
                        </span>
                        <Link href={`/championship/constructors/${driver.Constructor.constructorId ?? ""}`} style={{ color: "#bdb6b8", textDecoration: "none" }}>
                          {driver.Constructor.name}
                        </Link>
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 8px",
                        textAlign: "center",
                        borderBottom: "1px solid #3a171b",
                      }}
                    >
                      P{driver.grid}
                    </td>
                    <td
                      style={{
                        padding: "14px 8px",
                        textAlign: "center",
                        borderBottom: "1px solid #3a171b",
                        color:
                          statusText === "DNF" ? "#ff6b78" : "white",
                        fontWeight: statusText === "DNF" ? "bold" : "normal",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {statusText}
                    </td>
                    <td
                      style={{
                        padding: "14px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                        borderBottom: "1px solid #3a171b",
                      }}
                    >
                      {driver.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
