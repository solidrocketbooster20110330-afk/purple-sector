"use client";

import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useEffect, useMemo, useRef, useState } from "react";

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

type Race = {
  round: string;
  Results?: { Driver?: { driverId?: string }; points?: string }[];
  SprintResults?: { Driver?: { driverId?: string }; points?: string }[];
};

const red = "#ef233c";
const purple = "#7c3aed";
const muted = "#aaa1a4";
const grid = "#35191e";

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

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
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

const dashedDriverIds = new Set([
  "russell", "george_russell", "leclerc", "charles_leclerc",
  "piastri", "oscar_piastri", "hadjar", "isack_hadjar",
  "lawson", "liam_lawson", "stroll", "lance_stroll",
  "ocon", "esteban_ocon", "bottas", "valtteri_bottas",
  "bortoleto", "gabriel_bortoleto", "colapinto", "franco_colapinto",
  "albon", "alex_albon",
]);
const dashedDriverNames = new Set([
  "george russell", "charles leclerc", "oscar piastri", "isack hadjar",
  "liam lawson", "lance stroll", "esteban ocon", "valtteri bottas",
  "gabriel bortoleto", "franco colapinto", "alex albon",
]);
function driverDashArray(id: string, name: string): string | undefined {
  const normalizedName = name.toLowerCase().replace(/\s+/g, " ").trim();
  if (normalizedName.includes("yuki tsunoda")) return "1 5";
  return dashedDriverIds.has(id) || dashedDriverNames.has(normalizedName) ? "8 6" : undefined;
}

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
  const [data, setData] = useState<{
    drivers: DriverStanding[];
    races: Race[];
  } | null>(null);
  const [rankView, setRankView] = useState(false);
  const [animatedLinePoints, setAnimatedLinePoints] = useState<Record<string, string>>({});
  const animatedLinePointsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response = await fetch("/api/championship-data", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load championship data");
        }

        const sharedData = await response.json();
        const standingsData = sharedData?.standingsData;
        const scheduleData = sharedData?.scheduleData;
        const scheduledRaces: Race[] = scheduleData?.MRData?.RaceTable?.Races ?? [];
        const roundData: (Race | null)[] = sharedData?.roundData ?? [];

        if (cancelled) return;

        const races = roundData
          .filter((race): race is Race => race !== null)
          .sort((a, b) => Number(a.round) - Number(b.round));
        const rawDrivers: DriverStanding[] =
          standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]
            ?.DriverStandings ?? [];
        const totals = new Map<string, number>();

        for (const race of races) {
          for (const result of [
            ...(race.Results ?? []),
            ...(race.SprintResults ?? []),
          ]) {
            const id = result.Driver?.driverId;
            if (!id) continue;
            totals.set(id, (totals.get(id) ?? 0) + Number(result.points ?? 0));
          }
        }

        const drivers = rawDrivers
          .map((driver) => ({
            ...driver,
            points: String(totals.get(driver.Driver.driverId) ?? 0),
          }))
          .sort((a, b) => Number(b.points) - Number(a.points))
          .map((driver, index) => ({ ...driver, position: String(index + 1) }));

        setData({ drivers, races });
      } catch {
        if (!cancelled) setData({ drivers: [], races: [] });
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const drivers = data?.drivers ?? [];
  const races = data?.races ?? [];

  const visibleRaces = races;

  const chartDrivers = useMemo(() => {
    const base = drivers.map((driver) => {
      let cumulative = 0;
      const points = visibleRaces.map((race) => {
        const id = driver.Driver.driverId;
        const earned = [...(race.Results ?? []), ...(race.SprintResults ?? [])]
          .reduce((sum, result) => sum + (result.Driver?.driverId === id ? Number(result.points ?? 0) : 0), 0);
        cumulative += earned;
        return { round: race.round, value: cumulative };
      });

      const teamName = driver.Constructors?.[0]?.name ?? "";

      return {
        id: driver.Driver.driverId,
        name: `${driver.Driver.givenName} ${driver.Driver.familyName}`,
        color: teamColors[teamName] ?? "#777",
        points,
      };
    });

    return base.map((driver) => ({
      ...driver,
      ranks: driver.points.map((point, index) => {
        const ranked = base
          .map((other) => ({
            id: other.id,
            value: other.points[index]?.value ?? 0,
          }))
          .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));

        return {
          round: point.round,
          value: ranked.findIndex((item) => item.id === driver.id) + 1,
        };
      }),
    }));
  }, [drivers, visibleRaces]);
  const width = Math.max(360, Math.min(720, visibleRaces.length * 36));
  const height = 300;
  const pad = { top: 22, right: 18, bottom: 48, left: 50 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxPoints = Math.max(
    1,
    ...chartDrivers.flatMap((driver) =>
      driver.points.map((point) => point.value)
    )
  );
  const maxRank = Math.max(1, chartDrivers.length);

  const getX = (index: number) =>
    pad.left + (index * innerW) / Math.max(1, visibleRaces.length - 1);

  const getY = (value: number) =>
    rankView
      ? pad.top + ((value - 1) / Math.max(1, maxRank - 1)) * innerH
      : pad.top + innerH - (value / maxPoints) * innerH;

  const majorDrivers = chartDrivers;

  const linePointsByDriver = useMemo(() => Object.fromEntries(majorDrivers.map((driver) => {
    const series = rankView ? driver.ranks : driver.points;
    const line = series.map((point, index) => {
      const x = pad.left + (index * innerW) / Math.max(1, visibleRaces.length - 1);
      const y = rankView
        ? pad.top + ((point.value - 1) / Math.max(1, maxRank - 1)) * innerH
        : pad.top + innerH - (point.value / maxPoints) * innerH;
      return `${x},${y}`;
    }).join(" ");
    return [driver.id, line];
  })), [majorDrivers, rankView, innerW, innerH, maxRank, maxPoints, visibleRaces.length]);

  useEffect(() => {
    const targetLines = linePointsByDriver;
    const previous = animatedLinePointsRef.current;
    if (Object.keys(previous).length === 0) {
      animatedLinePointsRef.current = targetLines;
      setAnimatedLinePoints(targetLines);
      return;
    }
    const parsePoints = (value: string) =>
      value.trim().split(/\\s+/).map((pair) => pair.split(",").map(Number) as [number, number]);
    const pairs = Object.fromEntries(Object.entries(targetLines).map(([id, target]) => {
      const fromPoints = parsePoints(previous[id] ?? target);
      const toPoints = parsePoints(target);
      return [id, fromPoints.length === toPoints.length ? { fromPoints, toPoints } : null];
    }));
    const startTime = performance.now();
    const duration = 650;
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextLines: Record<string, string> = {};
      for (const [id, target] of Object.entries(targetLines)) {
        const pair = pairs[id];
        if (!pair) { nextLines[id] = target; continue; }
        const { fromPoints, toPoints } = pair as { fromPoints: [number, number][]; toPoints: [number, number][] };
        nextLines[id] = toPoints.map(([x, y], index) => {
          const [fromX, fromY] = fromPoints[index];
          return `${fromX + (x - fromX) * eased},${fromY + (y - fromY) * eased}`;
        }).join(" ");
      }
      animatedLinePointsRef.current = nextLines;
      setAnimatedLinePoints(nextLines);
      if (progress < 1) frame = requestAnimationFrame(animate);
      else {
        animatedLinePointsRef.current = targetLines;
        setAnimatedLinePoints(targetLines);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [linePointsByDriver]);

  const ticks = rankView
    ? Array.from({ length: maxRank }, (_, index) => index + 1)
    : [0, 0.25, 0.5, 0.75, 1].map((fraction) => maxPoints * fraction);

  if (!data) {
    return (
      <main style={pageStyle}>
        <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>
        <p style={{ color: muted }}>Loading...</p>
        <BottomNav />
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div style={tabsStyle}>
        <Link
          href="/championship"
          style={{
            ...tabStyle,
            background: "#211010",
            borderColor: red,
          }}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "10px",
          }}
        >
          <div style={{ color: red, fontSize: "13px", letterSpacing: "1px" }}>
            CHAMPIONSHIP PROGRESS
          </div>

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
              fontSize: "14px",
              whiteSpace: "nowrap",
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
                  transition: "left 220ms ease",
                }}
              />
            </span>
          </button>
        </div>

        <div style={{ color: muted, fontSize: "12px", marginBottom: "10px" }}>
          {rankView
            ? "Driver championship ranking by round"
            : "Cumulative driver points by round"}
        </div>

        {visibleRaces.length < 2 || chartDrivers.length === 0 ? (
          <p style={{ color: muted }}>Chart data가 충분하지 않습니다.</p>
        ) : (
          <>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                width={width}
                height={height}
                role="img"
                aria-label={
                  rankView
                    ? "Driver championship ranking progress graph"
                    : "Driver championship points progress graph"
                }
                style={{ display: "block" }}
              >
                {ticks.map((tick) => {
                  const y = getY(tick);

                  return (
                    <g key={`${rankView ? "rank" : "points"}-${tick}`}>
                      <line
                        x1={pad.left}
                        x2={width - pad.right}
                        y1={y}
                        y2={y}
                        stroke={grid}
                        strokeWidth="1"
                        style={{
                          transition: "y1 500ms ease, y2 500ms ease",
                        }}
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

                {majorDrivers.map((driver) => {
                  const series = rankView ? driver.ranks : driver.points;
                  const stroke = driver.color;
                  const dashArray = driverDashArray(driver.id, driver.name);

                  const line = animatedLinePoints[driver.id] ?? linePointsByDriver[driver.id] ?? series
                    .map((point, pointIndex) => `${getX(pointIndex)},${getY(point.value)}`)
                    .join(" ");

                  return (
                    <g key={driver.id}>
                      <polyline
                        points={line}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="2.5"
                        strokeDasharray={dashArray}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.95"
                        style={{
                          transition:
                            "all 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                      />

                      {series.map((point, pointIndex) => (
                        <circle
                          key={`${driver.id}-${pointIndex}`}
                          cx={getX(pointIndex)}
                          cy={getY(point.value)}
                          r="2.4"
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

                {visibleRaces.map((race, index) => (
                  <text
                    key={race.round}
                    x={getX(index)}
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
              {majorDrivers.map((driver) => {
                const dashArray = driverDashArray(driver.id, driver.name);

                return (
                  <div
                    key={driver.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <svg width="28" height="8" viewBox="0 0 28 8" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
                      <line
                        x1="0"
                        y1="4"
                        x2="28"
                        y2="4"
                        stroke={driver.color}
                        strokeWidth="3"
                        strokeDasharray={dashArray}
                        strokeLinecap="round"
                      />
                    </svg>
                    {driver.name}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <div style={cardStyle}>
        {drivers.length === 0 ? (
          <p style={{ color: muted }}>Driver 데이터가 없습니다.</p>
        ) : (
          drivers.map((driver, index) => {
            const teamName =
              driver.Constructors?.[0]?.name ?? "Unknown Team";

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
