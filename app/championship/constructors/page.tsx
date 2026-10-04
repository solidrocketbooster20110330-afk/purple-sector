import Link from "next/link";
import BottomNav from "../../components/BottomNav";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: {
    constructorId: string;
    name: string;
  };
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
  maxHeight: "600px",
  overflowY: "auto" as const,
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
  border: "1px solid #2b347a",
  color: "white",
};

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

export default async function ChampionshipConstructorsPage() {
  const [standingsRes, racesRes] = await Promise.all([
    fetch(
      "https://api.jolpi.ca/ergast/f1/2026/constructorstandings.json",
      { next: { revalidate: 3600 } }
    ),
    fetch(
      "https://api.jolpi.ca/ergast/f1/2026/results.json?limit=1000",
      { next: { revalidate: 3600 } }
    ),
  ]);

  const standingsData = await standingsRes.json();
  const racesData = await racesRes.json();

  const constructors: ConstructorStanding[] =
    standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  const races: Race[] = racesData?.MRData?.RaceTable?.Races ?? [];

  const chartTeams = constructors.slice(0, 5).map((constructor) => {
    let cumulative = 0;
    return {
      id: constructor.Constructor.constructorId,
      name: constructor.Constructor.name,
      points: races.map((race) => {
        const racePoints = (race.Results ?? [])
          .filter(
            (result) =>
              result.Constructor?.constructorId === constructor.Constructor.constructorId
          )
          .reduce((sum, result) => sum + Number(result.points ?? 0), 0);

        cumulative += racePoints;
        return { round: race.round, points: cumulative };
      }),
    };
  });

  return (
    <main style={pageStyle}>
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div style={tabsStyle}>
        <Link
          href="/championship"
          style={{ ...tabStyle, background: "#131942" }}
        >
          👤 Drivers
        </Link>
        <Link
          href="/championship/constructors"
          style={{ ...tabStyle, background: "#7c3aed" }}
        >
          🏭 Constructors
        </Link>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ color: "#a9adff", fontSize: "13px", marginBottom: "12px" }}>
          Championship Progress
        </div>
        <div
          style={{
            ...cardStyle,
            maxHeight: "none",
            overflow: "hidden",
          }}
        >
          <div style={{ color: "#a9adff", fontSize: "12px", marginBottom: "8px" }}>
            Cumulative constructor points by round
          </div>

          {(() => {
            const width = 720;
            const height = 260;
            const pad = { top: 20, right: 18, bottom: 42, left: 42 };
            const max = Math.max(
              1,
              ...chartTeams.flatMap((team) => team.points.map((p) => p.points))
            );
            const innerW = width - pad.left - pad.right;
            const innerH = height - pad.top - pad.bottom;
            const getX = (index: number) =>
              pad.left + (index * innerW) / Math.max(1, races.length - 1);
            const getY = (value: number) =>
              pad.top + innerH - (value / max) * innerH;
            const lineColors = [
              "#a855f7",
              "#5b8cff",
              "#ff7a45",
              "#4ade80",
              "#facc15",
            ];

            return (
              <>
                <div style={{ overflowX: "auto" }}>
                  <svg
                    viewBox="0 0 720 260"
                    width="100%"
                    height="260"
                    role="img"
                    aria-label="Constructor championship points progress graph"
                    style={{ display: "block", minWidth: "520px" }}
                  >
                    {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                      const gridY = getY(max * fraction);
                      return (
                        <g key={fraction}>
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
                            {Math.round(max * fraction)}
                          </text>
                        </g>
                      );
                    })}

                    {chartTeams.map((team, teamIndex) => {
                      const line = team.points
                        .map(
                          (point, index) =>
                            `${getX(index)},${getY(point.points)}`
                        )
                        .join(" ");

                      return (
                        <g key={team.id}>
                          <polyline
                            points={line}
                            fill="none"
                            stroke={lineColors[teamIndex]}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {team.points.map((point) => (
                            <circle
                              key={`${team.id}-${point.round}`}
                              cx={getX(Number(point.round) - 1)}
                              cy={getY(point.points)}
                              r="3.5"
                              fill="#a9adff"
                            />
                          ))}
                        </g>
                      );
                    })}

                    {races.map((race, index) => (
                      <text
                        key={race.round}
                        x={getX(index)}
                        y={height - 20}
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
                  {chartTeams.map((team, index) => (
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
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: lineColors[index],
                          display: "inline-block",
                        }}
                      />
                      {team.name}
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <div style={cardStyle}>
        {constructors.length === 0 ? (
          <p style={{ color: "#a9adff" }}>Constructor 데이터가 없습니다.</p>
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
