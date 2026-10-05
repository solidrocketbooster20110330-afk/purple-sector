import Link from "next/link";
import BottomNav from "../components/BottomNav";

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
  Results?: {
    Driver?: { driverId?: string };
    points?: string;
  }[];
};

const teamColors: Record<string, string> = {
  "Red Bull": "#3671C6",
  "Ferrari": "#E80020",
  "Mercedes": "#00D2BE",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine F1 Team": "#0093CC",
  "Williams": "#64C4FF",
  "RB F1 Team": "#6692FF",
  "Kick Sauber": "#52E252",
  "Haas F1 Team": "#B6BABD",
};

function getTeamColor(team: string) {
  return teamColors[team] ?? "#a9adff";
}

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

export default async function ChampionshipDriversPage() {
  const [standingsRes, racesRes] = await Promise.all([
    fetch(
      "https://api.jolpi.ca/ergast/f1/2026/driverstandings.json",
      { next: { revalidate: 3600 } }
    ),
    fetch(
      "https://api.jolpi.ca/ergast/f1/2026/results.json?limit=1000",
      { next: { revalidate: 3600 } }
    ),
  ]);

  const standingsData = await standingsRes.json();
  const racesData = await racesRes.json();

  const drivers: DriverStanding[] =
    standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  const races: Race[] = racesData?.MRData?.RaceTable?.Races ?? [];

  const chartDrivers = drivers.map((driver) => {
    let cumulative = 0;
    return {
      id: driver.Driver.driverId,
      name: `${driver.Driver.givenName} ${driver.Driver.familyName}`,
      team: driver.Constructors?.[0]?.name ?? "Unknown Team",
      color: getTeamColor(driver.Constructors?.[0]?.name ?? ""),
      points: races.map((race) => {
        const racePoints = (race.Results ?? [])
          .filter((result) => result.Driver?.driverId === driver.Driver.driverId)
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
          style={{ ...tabStyle, background: "#7c3aed" }}
        >
          👤 Drivers
        </Link>
        <Link
          href="/championship/constructors"
          style={{ ...tabStyle, background: "#131942" }}
        >
          🏭 Constructors
        </Link>
      </div>

      <section
        style={{
          ...cardStyle,
          maxHeight: "none",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            color: "#a9adff",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          Championship Progress
        </div>
        <div style={{ color: "#a9adff", fontSize: "12px", marginBottom: "8px" }}>
          Cumulative driver points by round
        </div>
        <div style={{ overflowX: "auto" }}>
          {(() => {
            const width = 720;
            const height = 260;
            const pad = { top: 20, right: 18, bottom: 42, left: 42 };
            const max = Math.max(
              1,
              ...chartDrivers.flatMap((driver) =>
                driver.points.map((point) => point.points)
              )
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
              "#ec4899",
              "#22d3ee",
              "#a78bfa",
            ];
            return (
              <>
                <svg
                  viewBox="0 0 720 260"
                  width="100%"
                  height="260"
                  role="img"
                  aria-label="Driver championship points progress graph"
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
                  {chartDrivers.map((driver, index) => {
                    const line = driver.points
                      .map(
                        (point, pointIndex) =>
                          `${getX(pointIndex)},${getY(point.points)}`
                      )
                      .join(" ");
                    return (
                      <g key={driver.id}>
                        <polyline
                          points={line}
                          fill="none"
                          stroke={driver.color}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {driver.points.map((point, pointIndex) => (
                          <circle
                            key={`${driver.id}-${point.round}`}
                            cx={getX(pointIndex)}
                            cy={getY(point.points)}
                            r="3"
                            fill={driver.color}
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
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "8px",
                  }}
                >
                  {chartDrivers.map((driver, index) => (
                    <div
                      key={driver.id}
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
                          background: driver.color,
                          display: "inline-block",
                        }}
                      />
                      {driver.name}
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      <div style={cardStyle}>
        {drivers.length === 0 ? (
          <p style={{ color: "#a9adff" }}>Driver 데이터가 없습니다.</p>
        ) : (
          drivers.map((driver, index) => (
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
                  index === drivers.length - 1 ? "none" : "1px solid #2b347a",
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
                <div style={{ color: "#a9adff", marginTop: "4px", fontSize: "13px" }}>
                  {driver.Constructors?.[0]?.name ?? "Unknown Team"}
                </div>
              </div>

              <strong>{driver.points} pts</strong>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
