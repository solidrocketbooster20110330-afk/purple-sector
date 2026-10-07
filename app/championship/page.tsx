"use client";

import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useEffect, useMemo, useState } from "react";

type DriverStanding = {
  position: string;
  points: string;
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
    permanentNumber?: string;
  };
  Constructors?: { name: string }[];
};

type RaceResult = {
  round: string;
  Results?: {
    Driver?: { driverId?: string };
    points?: string;
  }[];
};

const red = "#ef233c";
const purple = "#7c3aed";
const muted = "#aaa1a4";
const grid = "#35191e";

const teamColors: Record<string, string> = {
  McLaren: "#ff8000",
  Ferrari: "#e80020",
  "Red Bull Racing": "#3671c6",
  Mercedes: "#27f4d2",
  "Aston Martin": "#00665e",
  "Alpine F1 Team": "#ff87bc",
  Alpine: "#ff87bc",
  Williams: "#64c4ff",
  "Racing Bulls": "#6692ff",
  RB: "#6692ff",
  "Haas F1 Team": "#e6002b",
  Haas: "#e6002b",
  Audi: "#f50537",
  Cadillac: "#c9c9c9",
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#050505 0%,#140707 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#101010",
  border: "1px solid #3a1217",
  borderRadius: "20px",
  padding: "20px",
};

const tabsStyle = {
  display: "flex",
  gap: "12px",
  margin: "24px 0 20px",
};

const tabStyle = {
  flex: 1,
  padding: "14px 18px",
  borderRadius: "16px",
  textAlign: "center" as const,
  textDecoration: "none",
  fontWeight: "bold",
  border: "1px solid #3a1217",
  color: "white",
};

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

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
    width: "28px",
    height: "28px",
    marginRight: "8px",
    borderRadius: "50%",
    background: teamColors[name] ?? "#666",
    color: "#050505",
    fontSize: "10px",
    fontWeight: "900",
    flexShrink: 0,
  } as const;
}

export default function ChampionshipDriversPage() {
  const [data, setData] = useState<{ drivers: DriverStanding[]; races: RaceResult[] } | null>(null);
  const [rankView, setRankView] = useState(false);

  // Data is loaded client-side because the graph has an interactive points/ranking toggle.
  useEffect(() => {
    Promise.all([
      fetch("https://api.jolpi.ca/ergast/f1/2026/driverstandings.json").then((res) => res.json()),
      fetch("https://api.jolpi.ca/ergast/f1/2026/results.json?limit=1000").then((res) => res.json()),
    ])
      .then(([standingsData, racesData]) => {
        setData({
          drivers:
            standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [],
          races: racesData?.MRData?.RaceTable?.Races ?? [],
        });
      })
      .catch(() => setData({ drivers: [], races: [] }));
  }, []);

  if (!data) {
    return (
      <main style={pageStyle}>
        <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>
        <p style={{ color: muted }}>Loading...</p>
        <BottomNav />
      </main>
    );
  }

  const drivers = data.drivers;
  const races = data.races;
  const chartDrivers = drivers.map((driver) => {
    let cumulative = 0;

    return {
      id: driver.Driver.driverId,
      name: `${driver.Driver.givenName} ${driver.Driver.familyName}`,
      color: driver.Constructors?.[0]?.name
        ? teamColors[driver.Constructors[0].name] ?? "#777"
        : "#777",
      points: races.map((race) => {
        const racePoints = (race.Results ?? [])
          .filter((result) => result.Driver?.driverId === driver.Driver.driverId)
          .reduce((sum, result) => sum + Number(result.points ?? 0), 0);

        cumulative += racePoints;
        return { round: race.round, points: cumulative };
      }),
    };
  });

  const width = Math.max(720, races.length * 48);
  const height = 280;
  const pad = { top: 20, right: 18, bottom: 46, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  // Keep this page as a client component so the graph toggle can use React state.


  const chartDriversWithRanks = useMemo(() => {
    return chartDrivers.map((driver) => ({
      ...driver,
      ranks: driver.points.map((point, index) => {
        const ranked = chartDrivers
          .map((other) => ({
            id: other.id,
            value: other.points[index]?.points ?? 0,
          }))
          .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));

        return {
          round: point.round,
          value: ranked.findIndex((item) => item.id === driver.id) + 1,
        };
      }),
    }));
  }, [chartDrivers]);

  const maxPoints = Math.max(
    1,
    ...chartDrivers.flatMap((d) => d.points.map((p) => p.points))
  );
  const getX = (i: number) =>
    pad.left + (i * innerW) / Math.max(1, races.length - 1);
  const maxRank = Math.max(1, chartDriversWithRanks.length);
  const getY = (v: number) =>
    rankView
      ? pad.top + ((v - 1) / Math.max(1, maxRank - 1)) * innerH
      : pad.top + innerH - (v / maxPoints) * innerH;
  const majorDrivers = chartDriversWithRanks.slice(0, 8);

  return (
    <main style={pageStyle}>
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div style={tabsStyle}>
        <Link
          href="/championship"
          style={{ ...tabStyle, background: "#211010", borderColor: red }}
        >
          👤 Drivers
        </Link>
        <Link
          href="/championship/constructors"
          style={{ ...tabStyle, background: "#101010" }}
        >
          🏭 Constructors
        </Link>
      </div>

      <section style={{ ...cardStyle, marginBottom: "20px", overflow: "hidden" }}>
        <div
          style={{
            color: red,
            fontSize: "13px",
            marginBottom: "8px",
            letterSpacing: "1px",
          }}
        >
          CHAMPIONSHIP PROGRESS
        </div>

        <div style={{ color: muted, fontSize: "12px", marginBottom: "10px" }}>
          {rankView
            ? "Driver championship ranking by round"
            : "Cumulative driver points by round"}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <button
            type="button"
            onClick={() => setRankView((value) => !value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: muted,
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          >
            순위로 보기
            <span
              style={{
                width: "54px",
                height: "30px",
                borderRadius: "16px",
                background: rankView ? purple : "#151515",
                border: `1px solid ${grid}`,
                position: "relative",
                display: "inline-block",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: rankView ? "29px" : "3px",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: rankView ? "#f2e6e8" : "#7b5a60",
                  transition: "left .2s ease",
                }}
              />
            </span>
          </button>
        </div>

        {races.length < 2 ? (
          <p style={{ color: muted }}>Chart data가 충분하지 않습니다.</p>
        ) : (
          <>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                width={width}
                height={height}
                role="img"
                aria-label="Driver championship points progress graph"
                style={{ display: "block" }}
              >
                {(rankView
                  ? Array.from({ length: maxRank }, (_, index) => index + 1)
                  : [0, 0.25, 0.5, 0.75, 1].map(
                      (fraction) => maxPoints * fraction
                    )
                ).map((tick) => {
                  const y = getY(tick);
                  return (
                    <g key={f}>
                      <line
                        x1={pad.left}
                        x2={width - pad.right}
                        y1={y}
                        y2={y}
                        stroke={grid}
                        strokeWidth="1"
                      />
                      <text
                        x={pad.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        fill={muted}
                        fontSize="10"
                      >
                        {rankView ? `P${tick}` : Math.round(tick)}
                      </text>
                    </g>
                  );
                })}

                {majorDrivers.map((driver, index) => {
                  const stroke =
                    index === 0
                      ? red
                      : index === 1
                        ? purple
                        : driver.color;

                  const line = (rankView ? driver.ranks : driver.points)
                    .map((p, i) => `${getX(i)},${getY(rankView ? p.value : p.points)}`)
                    .join(" ");

                  return (
                    <g key={driver.id}>
                      <polyline
                        points={line}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={index < 2 ? "4" : "2.5"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={index < 2 ? "1" : "0.7"}
                        style={{
                          transition:
                            "all 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                      />
{index < 2 &&
                        (rankView ? driver.ranks : driver.points).map((p, i) => (
                          <circle
                            key={`${driver.id}-${i}`}
                            cx={getX(i)}
                            cy={getY(rankView ? p.value : p.points)}
                            r="3.2"
                            fill={stroke}
                            style={{
                              transition:
                                "cx 500ms cubic-bezier(0.22, 1, 0.36, 1), cy 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                            }}
                          />
                        ))}
                    </g>
                  );
                })}

                {races.map((race, i) => (
                  <text
                    key={race.round}
                    x={getX(i)}
                    y={height - 20}
                    textAnchor="middle"
                    fill={muted}
                    fontSize="9"
                  >
                    R{race.round}
                  </text>
                ))}
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              {majorDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      height: "3px",
                      background:
                        index === 0
                          ? red
                          : index === 1
                            ? purple
                            : driver.color,
                      display: "inline-block",
                    }}
                  />
                  {driver.name}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <div style={cardStyle}>
        {drivers.length === 0 ? (
          <p style={{ color: muted }}>Driver 데이터가 없습니다.</p>
        ) : (
          drivers.map((driver, index) => {
            const teamName = driver.Constructors?.[0]?.name ?? "Unknown Team";

            return (
              <Link
                key={driver.Driver.driverId}
                href={`/championship/${driver.Driver.driverId}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "50px 1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom:
                    index === drivers.length - 1
                      ? "none"
                      : `1px solid ${grid}`,
                  color: "white",
                  textDecoration: "none",
                }}
              >
                <strong>{positionLabel(driver.position)}</strong>

                <div>
                  <div>
                    #{driver.Driver.permanentNumber ?? "-"}{" "}
                    {driver.Driver.givenName} {driver.Driver.familyName}
                  </div>
                  <div
                    style={{
                      color: teamColors[teamName] ?? muted,
                      marginTop: "4px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={teamBadge(teamName)}>
                      {teamInitials(teamName)}
                    </span>
                    {teamName}
                  </div>
                </div>

                <strong
                  style={{
                    color: driver.position === "1" ? red : "white",
                  }}
                >
                  {driver.points} pts
                </strong>
              </Link>
            );
          })
        )}
      </div>

      <BottomNav />
    </main>
  );
}
