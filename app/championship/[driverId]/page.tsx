import Link from "next/link";
import BottomNav from "../../components/BottomNav";

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
  number: string;
  position: string;
  points: string;
  status: string;
  Driver: {
    givenName: string;
    familyName: string;
  };
  Constructor: {
    name: string;
  };
};

type Race = {
  raceName: string;
  round: string;
  date?: string;
  Results?: RaceResult[];
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
  marginBottom: "20px",
};

function positionLabel(position?: string, status?: string) {
  if (status?.toLowerCase() === "dnf") return "DNF";
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return position ? `P${position}` : "-";
}

type ChartPoint = {
  round: string;
  points: number;
};

function buildChart(races: Race[]): ChartPoint[] {
  let total = 0;
  return races.map((race) => {
    total += Number(race.Results?.[0]?.points ?? 0);
    return { round: race.round, points: total };
  });
}

function PointsChart({ points }: { points: ChartPoint[] }) {
  if (points.length < 2) return null;

  const width = 720;
  const height = 260;
  const pad = { top: 20, right: 18, bottom: 42, left: 42 };
  const max = Math.max(1, ...points.map((p) => p.points));
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const coords = points.map((p, i) => ({
    ...p,
    x: pad.left + (i * innerW) / Math.max(1, points.length - 1),
    y: pad.top + innerH - (p.points / max) * innerH,
  }));

  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad.left},${height - pad.bottom} ${line} ${coords[coords.length - 1].x},${height - pad.bottom}`;

  return (
    <section
      style={{
        background: "#131942",
        border: "1px solid #2b347a",
        borderRadius: "20px",
        padding: "20px",
        marginBottom: "20px",
        overflowX: "auto",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Championship Progress</h2>
      <div style={{ color: "#a9adff", fontSize: "12px", marginBottom: "8px" }}>
        Cumulative points by race
      </div>

      <svg
        viewBox="0 0 720 260"
        width="100%"
        role="img"
        aria-label="Championship points progress graph"
        style={{ display: "block", minWidth: "520px" }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = pad.top + innerH * (1 - fraction);
          return (
            <g key={fraction}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="#2b347a"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#a9adff"
                fontSize="10"
              >
                {Math.round(max * fraction)}
              </text>
            </g>
          );
        })}

        <polygon points={area} fill="rgba(124,58,237,0.16)" />

        <polyline
          points={line}
          fill="none"
          stroke="#a855f7"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((p, i) => (
          <g key={p.round}>
            <circle cx={p.x} cy={p.y} r="4" fill="#a9adff" />
            {(i === 0 ||
              i === coords.length - 1 ||
              i % Math.ceil(coords.length / 6) === 0) && (
              <>
                <text
                  x={p.x}
                  y={height - 20}
                  textAnchor="middle"
                  fill="#a9adff"
                  fontSize="10"
                >
                  R{p.round}
                </text>
                <text
                  x={p.x}
                  y={p.y - 9}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  {p.points}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </section>
  );
}

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;

  const [standingRes, resultsRes] = await Promise.all([
    fetch(
      "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
      { next: { revalidate: 3600 } }
    ),
    fetch(
      `https://api.jolpi.ca/ergast/f1/current/drivers/${driverId}/results.json?limit=100`,
      { next: { revalidate: 3600 } }
    ),
  ]);

  const standingData = await standingRes.json();
  const resultsData = await resultsRes.json();

  const standings: DriverStanding[] =
    standingData?.MRData?.StandingsTable?.StandingsLists?.[0]
      ?.DriverStandings ?? [];

  const driver = standings.find(
    (item) => item.Driver.driverId === driverId
  );

  const races: Race[] =
    resultsData?.MRData?.RaceTable?.Races ?? [];

  const resultDriver = races[0]?.Results?.[0];

  const name = driver
    ? `${driver.Driver.givenName} ${driver.Driver.familyName}`
    : resultDriver
    ? `${resultDriver.Driver.givenName} ${resultDriver.Driver.familyName}`
    : driverId;

  const position = driver?.position ?? "-";
  const points = driver?.points ?? "0";
  const team = driver?.Constructors?.[0]?.name ?? resultDriver?.Constructor?.name ?? "Unknown Team";
  const number = driver?.Driver.permanentNumber ?? "-";

  const wins = races.filter(
    (race) => race.Results?.[0]?.position === "1"
  ).length;

  const podiums = races.filter((race) => {
    const position = Number(race.Results?.[0]?.position);
    return Number.isFinite(position) && position >= 1 && position <= 3;
  }).length;

  const recentRaces = races.slice(-5).reverse();
  const chartPoints = buildChart(races);

  return (
    <main style={pageStyle}>
      <Link
        href="/championship"
        style={{ color: "#a9adff", textDecoration: "none" }}
      >
        ← Championship
      </Link>

      <section
        style={{
          ...cardStyle,
          marginTop: "20px",
          background:
            "linear-gradient(135deg,#171d57 0%,#131942 100%)",
        }}
      >
        <div style={{ color: "#a9adff", fontSize: "14px" }}>
          2026 DRIVER
        </div>

        <h1 style={{ margin: "8px 0 6px", fontSize: "32px" }}>
          #{number} {name}
        </h1>

        <div style={{ color: "#c7cbff" }}>{team}</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <div style={{ background: "#0d1232", borderRadius: "14px", padding: "14px" }}>
            <div style={{ color: "#a9adff", fontSize: "12px" }}>
              CHAMPIONSHIP
            </div>
            <strong style={{ fontSize: "24px" }}>
              {positionLabel(position)}
            </strong>
          </div>

          <div style={{ background: "#0d1232", borderRadius: "14px", padding: "14px" }}>
            <div style={{ color: "#a9adff", fontSize: "12px" }}>
              POINTS
            </div>
            <strong style={{ fontSize: "24px" }}>{points}</strong>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Season Stats</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: "12px",
          }}
        >
          {[
            ["WINS", String(wins)],
            ["PODIUMS", String(podiums)],
            ["RACES", String(races.length)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "#0d1232",
                borderRadius: "14px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  color: "#a9adff",
                  fontSize: "12px",
                  marginBottom: "5px",
                }}
              >
                {label}
              </div>
              <strong style={{ fontSize: "22px" }}>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <PointsChart points={chartPoints} />

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recent Form</h2>

        {recentRaces.length === 0 ? (
          <p style={{ color: "#a9adff" }}>최근 레이스 데이터가 없습니다.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {recentRaces.map((race) => {
              const result = race.Results?.[0];
              return (
                <div
                  key={race.round}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: "1px solid #2b347a",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>{race.raceName}</div>
                    <div
                      style={{
                        color: "#a9adff",
                        fontSize: "12px",
                        marginTop: "3px",
                      }}
                    >
                      Round {race.round}
                    </div>
                  </div>
                  <strong>
                    {result?.status?.toLowerCase() === "dnf"
                      ? "DNF"
                      : result?.position
                      ? positionLabel(result.position, result.status)
                      : "-"}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Race Results</h2>

        {races.length === 0 ? (
          <p style={{ color: "#a9adff" }}>Race data가 없습니다.</p>
        ) : (
          races
            .slice()
            .reverse()
            .map((race) => {
              const result = race.Results?.[0];

              return (
                <div
                  key={race.round}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 1fr auto",
                    gap: "12px",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid #2b347a",
                  }}
                >
                  <strong>{positionLabel(result?.position, result?.status)}</strong>

                  <div>
                    <div style={{ fontWeight: "bold" }}>{race.raceName}</div>
                    <div style={{ color: "#a9adff", marginTop: "4px", fontSize: "13px" }}>
                      Round {race.round}
                    </div>
                  </div>

                  <strong>{result?.points ?? "0"} pts</strong>
                </div>
              );
            })
        )}
      </section>

      <BottomNav />
    </main>
  );
}
