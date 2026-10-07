"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "../../components/BottomNav";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: { constructorId: string; name: string };
};

type Race = {
  round: string;
  Results?: {
    Constructor?: { constructorId?: string };
    points?: string;
  }[];
};

type ChartPoint = {
  round: string;
  points: number;
};

type ChartTeam = {
  id: string;
  name: string;
  points: ChartPoint[];
};

type RankedTeam = ChartTeam & {
  ranks: { round: string; rank: number }[];
};

const red = "#ef233c";
const purple = "#7c3aed";
const muted = "#aaa1a4";
const grid = "#35191e";
const dimLine = "#7b5a60";

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

const tabsStyle = { display: "flex", gap: "12px", margin: "24px 0 20px" };

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

function buildRankedTeams(chartTeams: ChartTeam[]): RankedTeam[] {
  return chartTeams.map((team) => ({
    ...team,
    ranks: team.points.map((point, index) => {
      const order = chartTeams
        .map((other) => ({
          id: other.id,
          points: other.points[index]?.points ?? 0,
        }))
        .sort((a, b) => b.points - a.points || a.id.localeCompare(b.id));

      return {
        round: point.round,
        rank: order.findIndex((item) => item.id === team.id) + 1,
      };
    }),
  }));
}

export default function ChampionshipConstructorsPage() {
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [rankView, setRankView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("https://api.jolpi.ca/ergast/f1/2026/constructorstandings.json").then((r) => r.json()),
      fetch("https://api.jolpi.ca/ergast/f1/2026/results.json?limit=2000").then((r) => r.json()),
    ])
      .then(([standingsData, racesData]) => {
        setConstructors(
          standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []
        );
        setRaces(racesData?.MRData?.RaceTable?.Races ?? []);
      })
      .catch(() => {
        setConstructors([]);
        setRaces([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartTeams = useMemo<ChartTeam[]>(
    () =>
      constructors.map((constructor) => {
        let cumulative = 0;

        return {
          id: constructor.Constructor.constructorId,
          name: constructor.Constructor.name,
          points: races.map((race) => {
            const earned = (race.Results ?? [])
              .filter(
                (result) =>
                  result.Constructor?.constructorId ===
                  constructor.Constructor.constructorId
              )
              .reduce((sum, result) => sum + Number(result.points ?? 0), 0);

            cumulative += earned;

            return {
              round: race.round,
              points: cumulative,
            };
          }),
        };
      }),
    [constructors, races]
  );

  const rankedTeams = useMemo<RankedTeam[]>(
    () => buildRankedTeams(chartTeams),
    [chartTeams]
  );

  const width = Math.max(720, races.length * 48);
  const height = 300;
  const pad = { top: 20, right: 18, bottom: 44, left: 46 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxPoints = Math.max(
    1,
    ...chartTeams.flatMap((team) => team.points.map((p) => p.points))
  );
  const maxRank = Math.max(1, constructors.length);

  const getX = (index: number) =>
    pad.left + (index * innerW) / Math.max(1, races.length - 1);

  const getPointsY = (value: number) =>
    pad.top + innerH - (value / maxPoints) * innerH;

  const getRankY = (rank: number) =>
    pad.top + ((rank - 1) / Math.max(1, maxRank - 1)) * innerH;

  const visibleTeams: ChartTeam[] | RankedTeam[] = rankView
    ? rankedTeams
    : chartTeams;

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
          ) : races.length < 2 ? (
            <p style={{ color: muted }}>Chart data가 충분하지 않습니다.</p>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  width="100%"
                  height={height}
                  role="img"
                  aria-label="Constructor championship graph"
                  style={{ display: "block", minWidth: `${width}px` }}
                >
                  {(rankView
                    ? Array.from({ length: maxRank }, (_, index) => index + 1)
                    : [0, 0.25, 0.5, 0.75, 1].map((fraction) => maxPoints * fraction)
                  ).map((tick) => {
                    const y = rankView ? getRankY(tick) : getPointsY(tick);

                    return (
                      <g key={String(tick)}>
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

                  {visibleTeams.map((team, teamIndex) => {
                    const values = rankView ? team.ranks : team.points;
                    const stroke =
                      teamIndex === 0
                        ? red
                        : teamIndex === 1
                        ? purple
                        : dimLine;

                    const line = values
                      .map((point, index) => {
                        const value = rankView
                          ? (point as RankedTeam["ranks"][number]).rank
                          : (point as ChartPoint).points;

                        return `${getX(index)},${rankView ? getRankY(value) : getPointsY(value)}`;
                      })
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
                          values.map((point, index) => {
                            const value = rankView
                              ? (point as RankedTeam["ranks"][number]).rank
                              : (point as ChartPoint).points;

                            return (
                              <circle
                                key={`${team.id}-${index}`}
                                cx={getX(index)}
                                cy={rankView ? getRankY(value) : getPointsY(value)}
                                r="3.2"
                                fill={stroke}
                              />
                            );
                          })}
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
                {visibleTeams.map((team, index) => (
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
                          index === 0 ? red : index === 1 ? purple : dimLine,
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
