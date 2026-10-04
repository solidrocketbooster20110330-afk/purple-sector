"use client";

import BottomNav from "../components/BottomNav";
import ResultsTabs from "./ResultsTabs";
import { useEffect, useState } from "react";
import {
  fetchGrandPrix,
  getGrandPrixByRound,
  getLatestGrandPrix,
  getRelevantGrandPrix,
  getStoredGrandPrixRound,
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
  Driver: { givenName: string; familyName: string };
  Constructor: { name: string };
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
  color: "white",
  padding: "20px",
  paddingBottom: "90px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#131942",
  border: "1px solid #2b347a",
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

export default function ResultsPage() {
  const [races, setRaces] = useState<GrandPrix[]>([]);
  const [selectedRace, setSelectedRace] = useState<GrandPrix | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetchGrandPrix()
      .then((items) => {
        setRaces(items);
        const queryRound = new URLSearchParams(window.location.search).get("round");
        const stored = getStoredGrandPrixRound();
        const selected =
          getGrandPrixByRound(items, queryRound) ??
          getGrandPrixByRound(items, stored) ??
          getRelevantGrandPrix(items) ??
          getLatestGrandPrix(items);
        setSelectedRace(selected);
        if (selected) storeGrandPrix(selected.round);
      })
      .catch(() => setRaces([]))
      .finally(() => {
        setHydrated(true);
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
            color: "#a9adff",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          <span>{selectedRace?.raceName ?? (loading ? "Loading..." : "Grand Prix")}</span>
          <span
            style={{
              fontSize: "12px",
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
              background: "#131942",
              border: "1px solid #2b347a",
              borderRadius: "14px",
              padding: "8px",
              maxHeight: "320px",
              overflowY: "auto",
              boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            }}
          >
            {races.slice().reverse().map((race) => {
              const active = selectedRace?.round === race.round;
              return (
                <button
                  key={`${race.season}-${race.round}`}
                  type="button"
                  onClick={() => {
                    setSelectedRace(race);
                    storeGrandPrix(race.round);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "block",
                    textAlign: "left",
                    padding: "10px 12px",
                    marginBottom: "4px",
                    border: 0,
                    borderRadius: "10px",
                    background: active ? "#7c3aed" : "transparent",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  {race.raceName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ResultsTabs />

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
              <col style={{ width: "150px" }} />
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
                      color: "#a9adff",
                      borderBottom: "2px solid #2b347a",
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
                    <td style={{ padding: "11px 7px", textAlign: "center", fontWeight: "bold", borderBottom: "1px solid #2b347a" }}>
                      {positionLabel(driver.position)}
                    </td>
                    <td style={{ padding: "14px 8px", textAlign: "center", fontWeight: "bold", borderBottom: "1px solid #2b347a" }}>
                      #{driver.number}
                    </td>
                    <td style={{ padding: "14px 8px", borderBottom: "1px solid #2b347a", whiteSpace: "nowrap" }}>
                      {driver.Driver.givenName} {driver.Driver.familyName}
                    </td>
                    <td style={{ padding: "14px 8px", borderBottom: "1px solid #2b347a", color: "#a9adff", whiteSpace: "normal" }}>
                      {driver.Constructor.name}
                    </td>
                    <td style={{ padding: "14px 8px", textAlign: "center", borderBottom: "1px solid #2b347a" }}>
                      P{driver.grid}
                    </td>
                    <td style={{ padding: "14px 8px", textAlign: "center", borderBottom: "1px solid #2b347a", color: statusText === "DNF" ? "#ff7a7a" : "white", fontWeight: statusText === "DNF" ? "bold" : "normal", whiteSpace: "nowrap" }}>
                      {statusText}
                    </td>
                    <td style={{ padding: "14px 8px", textAlign: "center", fontWeight: "bold", borderBottom: "1px solid #2b347a" }}>
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
