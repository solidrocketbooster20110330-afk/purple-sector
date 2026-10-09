"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import BottomNav from "../../components/BottomNav";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: { constructorId: string; name: string };
};

type Race = {
  round: string;
  Results?: { Constructor?: { constructorId?: string }; points?: string }[];
  SprintResults?: { Constructor?: { constructorId?: string }; points?: string }[];
};

type ChartPoint = {
  round: string;
  value: number;
};

type ChartTeam = {
  id: string;
  name: string;
  points: ChartPoint[];
  ranks: ChartPoint[];
};

const red = "#ef233c";
const purple = "#7c3aed";
const muted = "#aaa1a4";
const grid = "#35191e";
const dimLine = "#7b5a60";

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

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as T;
}

export default function ChampionshipConstructorsPage() {
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [rankView, setRankView] = useState(false);
  const [animatedLinePoints, setAnimatedLinePoints] = useState<Record<string, string>>({});
  const animatedLinePointsRef = useRef<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response = await fetch("/api/championship-data", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load constructor championship data");
        }
        const sharedData = await response.json();
        const standingsData = sharedData?.constructors ?? [];
        const roundData: (Race | null)[] = sharedData?.roundData ?? [];

        if (cancelled) return;

        const completedRaces = roundData
          .filter((race): race is Race => race !== null)
          .sort((a, b) => Number(a.round) - Number(b.round));
        const rawConstructors: ConstructorStanding[] = Array.isArray(standingsData)
          ? standingsData
          : [];
        const totals = new Map<string, number>();

        for (const race of completedRaces) {
          for (const result of [
            ...(race.Results ?? []),
            ...(race.SprintResults ?? []),
          ]) {
            const id = result.Constructor?.constructorId;
            if (!id) continue;
            totals.set(id, (totals.get(id) ?? 0) + Number(result.points ?? 0));
          }
        }

        const sortedConstructors = rawConstructors
          .map((constructor) => ({
            ...constructor,
            points: String(totals.get(constructor.Constructor.constructorId) ?? 0),
          }))
          .sort((a, b) => Number(b.points) - Number(a.points))
          .map((constructor, index) => ({
            ...constructor,
            position: String(index + 1),
          }));

        setConstructors(sortedConstructors);
        setRaces(completedRaces);
      } catch {
        if (cancelled) return;
        setConstructors([]);
        setRaces([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartTeams = useMemo<ChartTeam[]>(() => {
    const teams = constructors.map((constructor) => {
      const id = constructor.Constructor.constructorId;
      let cumulative = 0;

      const points = races.map((race) => {
        const earned = [...(race.Results ?? []), ...(race.SprintResults ?? [])]
          .reduce((sum, result) => sum + (result.Constructor?.constructorId === id ? Number(result.points ?? 0) : 0), 0);

        cumulative += earned;
        return { round: race.round, value: cumulative };
      });

      return {
        id,
        name: constructor.Constructor.name,
        points,
        ranks: [],
      };
    });

    return teams.map((team) => ({
      ...team,
      ranks: team.points.map((point, index) => {
        const ranked = teams
          .map((other) => ({
            id: other.id,
            value: other.points[index]?.value ?? 0,
          }))
          .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));

        return {
          round: point.round,
          value: ranked.findIndex((item) => item.id === team.id) + 1,
        };
      }),
    }));
  }, [constructors, races]);

  const maxPoints = Math.max(
    1,
    ...chartTeams.flatMap((team) => team.points.map((point) => point.value))
  );
  const maxRank = Math.max(1, chartTeams.length);
  const width = Math.max(360, Math.min(720, races.length * 36));
  const height = 300;
  const pad = { top: 20, right: 18, bottom: 44, left: 46 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const getX = (index: number) =>
    pad.left + (index * innerW) / Math.max(1, races.length - 1);
  const getY = (value: number) =>
    rankView
      ? pad.top + ((value - 1) / Math.max(1, maxRank - 1)) * innerH
      : pad.top + innerH - (value / maxPoints) * innerH;

  const linePointsByTeam = useMemo(() => Object.fromEntries(chartTeams.map((team) => {
    const points = rankView ? team.ranks : team.points;
    const line = points.map((point, index) => {
      const x = pad.left + (index * innerW) / Math.max(1, races.length - 1);
      const y = rankView
        ? pad.top + ((point.value - 1) / Math.max(1, maxRank - 1)) * innerH
        : pad.top + innerH - (point.value / maxPoints) * innerH;
      return String(x) + "," + String(y);
    }).join(" ");
    return [team.id, line];
  })), [chartTeams, rankView, innerW, innerH, maxRank, maxPoints, races.length]);

  useEffect(() => {
    const targetLines = linePointsByTeam;
    const previous = animatedLinePointsRef.current;
    const previousIds = Object.keys(previous);

    if (previousIds.length === 0) {
      animatedLinePointsRef.current = targetLines;
      setAnimatedLinePoints(targetLines);
      return;
    }

    const parsePoints = (value: string) =>
      value.trim().split(/\s+/).map((pair) => pair.split(",").map(Number) as [number, number]);

    const pairs = Object.fromEntries(
      Object.entries(targetLines).map(([id, target]) => {
        const fromPoints = parsePoints(previous[id] ?? target);
        const toPoints = parsePoints(target);
        return [id, fromPoints.length === toPoints.length ? { fromPoints, toPoints } : null];
      })
    );

    const startTime = performance.now();
    const duration = 500;
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextLines: Record<string, string> = {};

      for (const [id, target] of Object.entries(targetLines)) {
        const pair = pairs[id];
        if (!pair) {
          nextLines[id] = target;
          continue;
        }
        const { fromPoints, toPoints } = pair as {
          fromPoints: [number, number][];
          toPoints: [number, number][];
        };
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
  }, [linePointsByTeam]);

  return (
    <main style={pageStyle}>
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div style={tabsStyle}>
        <Link href="/championship" style={{ ...tabStyle, background: "#101010" }}>
          👤 Drivers
        </Link>
        <Link
          href="/championship/constructors"
          style={{ ...tabStyle, background: "#211010", borderColor: red }}
        >
          🏭 Constructors
        </Link>
      </div>

      <section style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
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
            }}
          >
            순위로 보기
            <span
              style={{
                width: "54px",
                height: "30px",
                borderRadius: "16px",
                background: rankView ? purple : "#151515",
                border: "1px solid #3a1217",
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
                  background: rankView ? "#f2e6e8" : dimLine,
                  transition: "left .2s ease",
                }}
              />
            </span>
          </button>
        </div>

        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div style={{ color: muted, fontSize: "12px", marginBottom: "8px" }}>
            {rankView
              ? "Constructor championship ranking by round"
              : "Cumulative constructor points by round"}
          </div>

          {loading ? (
            <p style={{ color: muted }}>Loading...</p>
          ) : races.length < 2 || chartTeams.length === 0 ? (
            <p style={{ color: muted }}>Chart data가 충분하지 않습니다.</p>
          ) : (
            <>
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  width={width}
                  height={height}
                  role="img"
                  aria-label="Constructor championship graph"
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
                      <g key={`tick-${tick}`}>
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

                  {chartTeams.map((team, teamIndex) => {
                    const points = rankView ? team.ranks : team.points;
                    const stroke =
                      teamColors[team.name] ??
                      (teamIndex === 0 ? red : teamIndex === 1 ? purple : dimLine);

                    const line = animatedLinePoints[team.id] ?? linePointsByTeam[team.id] ?? points
                      .map((point, index) => `${getX(index)},${getY(point.value)}`)
                      .join(" ");

                    return (
                      <g key={team.id}>
                        <polyline
                          points={line}
                          fill="none"
                          stroke={stroke}
                          strokeWidth={teamIndex < 2 ? "4" : "2.5"}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={teamIndex < 2 ? "1" : "0.7"}
                        />
                        {teamIndex < 2 &&
                          points.map((point, index) => (
                            <circle
                              key={`${team.id}-${index}`}
                              cx={getX(index)}
                              cy={getY(point.value)}
                              r="3.2"
                              fill={stroke}
                            />
                          ))}
                      </g>
                    );
                  })}

                  {races.map((race, index) => (
                    <text
                      key={race.round}
                      x={getX(index)}
                      y={height - 18}
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
                {chartTeams.map((team, index) => (
                  <div
                    key={team.id}
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
                          teamColors[team.name] ??
                          (index === 0 ? red : index === 1 ? purple : dimLine),
                        display: "inline-block",
                      }}
                    />
                    {team.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <div style={{ ...cardStyle, maxHeight: "600px", overflowY: "auto" }}>
        {constructors.length === 0 ? (
          <p style={{ color: muted }}>Constructor 데이터가 없습니다.</p>
        ) : (
          constructors.map((constructor, index) => (
            <Link
              key={constructor.Constructor.constructorId}
              href={`/championship/constructors/${constructor.Constructor.constructorId}`}
              style={{
                display: "grid",
                gridTemplateColumns: "50px 1fr auto",
                gap: "12px",
                alignItems: "center",
                padding: "14px 0",
                borderBottom:
                  index === constructors.length - 1
                    ? "none"
                    : `1px solid ${grid}`,
                color: "white",
                textDecoration: "none",
              }}
            >
              <strong>{positionLabel(constructor.position)}</strong>
              <div style={{ fontWeight: "bold" }}>
                {constructor.Constructor.name}
              </div>
              <strong
                style={{
                  color: constructor.position === "1" ? red : "white",
                }}
              >
                {constructor.points} pts
              </strong>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
