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

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#131942",
  border: "1px solid #2b347a",
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
  border: "1px solid #2b347a",
  color: "white",
};

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

const lineColors = [
  "#a855f7",
  "#5b8cff",
  "#ff7a45",
  "#4ade80",
  "#facc15",
  "#ec4899",
  "#22d3ee",
  "#a78bfa",
  "#14b8a6",
  "#94a3b8",
];

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
      .finally(() => setLoading(false));
  }, []);

  const teamColors: Record<string, string> = {
  red_bull: "#3671C6",
  ferrari: "#E80020",
  mercedes: "#00D2BE",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#0093CC",
  williams: "#64C4FF",
  haas: "#B6BABD",
  rb: "#6692FF",
  sauber: "#52E252",
};

  const chartTeams = useMemo(
    () =>
      constructors.map((constructor) => {
        let cumulative = 0;
        return {
          id: constructor.Constructor.constructorId,
          name: constructor.Constructor.name,
          points: races.map((race) => {
            cumulative += (race.Results ?? [])
              .filter(
                (result) =>
                  result.Constructor?.constructorId ===
                  constructor.Constructor.constructorId
              )
              .reduce((sum, result) => sum + Number(result.points ?? 0), 0);
            return { round: race.round, points: cumulative };
          }),
        };
      }),
    [constructors, races]
  );

  const rankedTeams = useMemo(
    () =>
      chartTeams.map((team) => ({
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
      })),
    [chartTeams]
  );

  return (
    <main style={pageStyle}>
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div style={tabsStyle}>
        <Link href="/championship" style={{ ...tabStyle, background: "#131942" }}>
          👤 Drivers
        </Link>
        <Link
          href="/championship/constructors"
          style={{ ...tabStyle, background: "#7c3aed" }}
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
          <div style={{ color: "#a9adff", fontSize: "13px" }}>
            Championship Progress
          </div>
          <button
            type="button"
            onClick={() => setRankView((value) => !value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#c7cbff",
              fontSize: "13px",
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
                background: rankView ? "#7c3aed" : "#131942",
                border: "1px solid #2b347a",
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
                  background: "#a9adff",
                  transition: "left .2s ease",
                }}
              />
            </span>
          </button>
        </div>

        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div style={{ color: "#a9adff", fontSize: "12px", marginBottom: "8px" }}>
            {rankView
              ? "Constructor championship ranking by round"
              : "Cumulative constructor points by round"}
          </div>

          {loading ? (
            <p style={{ color: "#a9adff" }}>Loading...</p>
          ) : races.length < 1 ? (
            <p style={{ color: "#a9adff" }}>Chart data가 없습니다.</p>
          ) : (
            (() => {
              const width = Math.max(720, races.length * 42);
              const height = 300;
              const pad = { top: 20, right: 18, bottom: 44, left: 42 };
              const innerW = width - pad.left - pad.right;
              const innerH = height - pad.top - pad.bottom;
              const maxRank = Math.max(1, Math.min(10, constructors.length));
              const maxPoints = Math.max(
                1,
                ...chartTeams.flatMap((team) => team.points.map((p) => p.points))
              );
              const max = rankView ? maxRank : maxPoints;
              const getX = (index: number) =>
                pad.left + (index * innerW) / Math.max(1, races.length - 1);
              const getY = (value: number) =>
                rankView
                  ? pad.top + ((value - 1) / Math.max(1, maxRank - 1)) * innerH
                  : pad.top + innerH - (value / max) * innerH;
              const teams: any[] = rankView ? rankedTeams : chartTeams;

              return (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <svg
                      viewBox="0 0 720 300"
                      width="100%"
                      height="300"
                      role="img"
                      aria-label="Constructor championship graph"
                      style={{ display: "block", minWidth: `${width}px` }}
                    >
                      {(rankView
                        ? Array.from({ length: maxRank }, (_, index) => index + 1)
                        : [0, 0.25, 0.5, 0.75, 1].map((fraction) => max * fraction)
                      ).map((tick) => {
                        const gridY = getY(tick);
                        return (
                          <g key={String(tick)}>
                            <line
                              x1={pad.left}
                              x2={width - pad.right}
                              y1={gridY}
                              y2={gridY}
                              stroke="#2b347a"
                              strokeWidth="1"
                            />
                            <text
                              x={pad.left - 8}
                              y={gridY + 4}
                              textAnchor="end"
                              fill="#a9adff"
                              fontSize="10"
                            >
                              {rankView ? `P${tick}` : Math.round(tick)}
                            </text>
                          </g>
                        );
                      })}

                      {teams.map((team, teamIndex) => {
                        const values = rankView ? team.ranks : team.points;
                        const line = values
                          .map(
                            (point: any, index: number) =>
                              `${getX(index)},${getY(rankView ? point.rank : point.points)}`
                          )
                          .join(" ");

                        return (
                          <g key={team.id}>
                            <polyline
                              points={line}
                              fill="none"
                              stroke={team.color}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {values.map((point: any, index: number) => (
                              <circle
                                key={`${team.id}-${index}`}
                                cx={getX(index)}
                                cy={getY(rankView ? point.rank : point.points)}
                                r="3"
                                fill={lineColors[teamIndex % lineColors.length]}
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
                          fill="#a9adff"
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
                    {teams.map((team, index) => (
                      <div
                        key={team.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "white",
                          fontSize: "12px",
                        }}
                      >
                        <span
                          style={{
                            width: "28px",
                            height: "3px",
                            background: team.color,
                            display: "inline-block",
                          }}
                        />
                        {team.name}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()
          )}
        </div>
      </section>

      <div style={{ ...cardStyle, maxHeight: "600px", overflowY: "auto" }}>
        {constructors.length === 0 ? (
          <p style={{ color: "#a9adff" }}>Constructor 데이터가 없습니다.</p>
        ) : (
          constructors.map((constructor, index) => (
            <Link
              key={constructor.Constructor.constructorId}
              href={"/championship/constructors/" + constructor.Constructor.constructorId}
              style={{
                display: "grid",
                gridTemplateColumns: "50px 1fr auto",
                gap: "12px",
                alignItems: "center",
                padding: "14px 0",
                borderBottom:
                  index === constructors.length - 1 ? "none" : "1px solid #2b347a",
                color: "white",
                textDecoration: "none",
              }}
            >
              <strong>{positionLabel(constructor.position)}</strong>
              <div style={{ fontWeight: "bold" }}>
                {constructor.Constructor.name}
              </div>
              <strong>{constructor.points} pts</strong>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
