import Link from "next/link";
import BottomNav from "../../../components/BottomNav";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: {
    constructorId: string;
    name: string;
  };
};

type RaceResult = {
  position: string;
  points: string;
  Driver: {
    driverId?: string;
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

function positionLabel(position?: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return position ? `P${position}` : "-";
}

type ChartPoint = {
  round: string;
  points: number;
};

function buildConstructorChart(races: Race[]): ChartPoint[] {
  let total = 0;

  return races.map((race) => {
    total += (race.Results ?? []).reduce(
      (sum, result) => sum + Number(result.points ?? 0),
      0
    );

    return {
      round: race.round,
      points: total,
    };
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
        Cumulative constructor points by race
      </div>

      <svg
        viewBox="0 0 720 260"
        width="100%"
        role="img"
        aria-label="Constructor championship points progress graph"
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

export default async function ConstructorDetailPage({
  params,
}: {
  params: Promise<{ constructorId: string }>;
}) {
  const { constructorId } = await params;

  const [standingRes, resultsRes] = await Promise.all([
    fetch(
      "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
      { next: { revalidate: 3600 } }
    ),
    fetch(
      `https://api.jolpi.ca/ergast/f1/current/constructors/${constructorId}/results.json?limit=100`,
      { next: { revalidate: 3600 } }
    ),
  ]);

  const standingData = await standingRes.json();
  const resultsData = await resultsRes.json();

  const standings: ConstructorStanding[] =
    standingData?.MRData?.StandingsTable?.StandingsLists?.[0]
      ?.ConstructorStandings ?? [];

  const constructor = standings.find(
    (item) => item.Constructor.constructorId === constructorId
  );

  const races: Race[] =
    resultsData?.MRData?.RaceTable?.Races ?? [];

  const drivers = Array.from(
    new Map(
      races
        .flatMap((race) => race.Results ?? [])
        .map((result) => [
          result.Driver.driverId ??
            `${result.Driver.givenName}-${result.Driver.familyName}`,
          `${result.Driver.givenName} ${result.Driver.familyName}`,
        ])
    ).values()
  );

  const name = constructor?.Constructor.name ?? constructorId;
  const position = constructor?.position ?? "-";
  const points = constructor?.points ?? "0";

  const wins = races.reduce(
    (sum, race) =>
      sum +
      (race.Results?.filter((result) => result.position === "1").length ?? 0),
    0
  );

  const podiums = races.reduce(
    (sum, race) =>
      sum +
      (race.Results?.filter((result) => {
        const position = Number(result.position);
        return Number.isFinite(position) && position >= 1 && position <= 3;
      }).length ?? 0),
    0
  );

  const recentRaces = races.slice(-5).reverse();
  const chartPoints = buildConstructorChart(races);

  return (
    <main style={pageStyle}>
      <Link
        href="/championship/constructors"
        style={{ color: "#a9adff", textDecoration: "none" }}
      >
        ← Constructors
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
          2026 CONSTRUCTOR
        </div>

        <h1 style={{ margin: "8px 0 6px", fontSize: "32px" }}>
          {name}
        </h1>

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
        <h2 style={{ marginTop: 0 }}>Drivers</h2>

        {drivers.length === 0 ? (
          <p style={{ color: "#a9adff" }}>Driver data가 없습니다.</p>
        ) : (
          drivers.map((driver, index) => (
            <div
              key={driver}
              style={{
                padding: "12px 0",
                borderBottom:
                  index === drivers.length - 1 ? "none" : "1px solid #2b347a",
              }}
            >
              {driver}
            </div>
          ))
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recent Form</h2>

        {recentRaces.length === 0 ? (
          <p style={{ color: "#a9adff" }}>최근 레이스 데이터가 없습니다.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {recentRaces.map((race) => {
              const resultsForRace = race.Results ?? [];
              const positions = resultsForRace
                .map((result) => Number(result.position))
                .filter(Number.isFinite);

              const bestPosition = positions.length
                ? Math.min(...positions)
                : null;

              const racePoints = resultsForRace.reduce(
                (sum, result) => sum + Number(result.points ?? 0),
                0
              );

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

                  <div style={{ textAlign: "right" }}>
                    <strong>
                      {bestPosition ? `P${bestPosition}` : "-"}
                    </strong>
                    <div
                      style={{
                        color: "#a9adff",
                        fontSize: "12px",
                        marginTop: "3px",
                      }}
                    >
                      {racePoints} pts
                    </div>
                  </div>
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
              const totalPoints =
                race.Results?.reduce(
                  (sum, result) => sum + Number(result.points ?? 0),
                  0
                ) ?? 0;

              const positions =
                race.Results
                  ?.map((result) => Number(result.position))
                  .filter(Number.isFinite) ?? [];

              return (
                <div
                  key={race.round}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr auto",
                    gap: "12px",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid #2b347a",
                  }}
                >
                  <strong>
                    {positions.length
                      ? `P${Math.min(...positions)}`
                      : "-"}
                  </strong>

                  <div>
                    <div style={{ fontWeight: "bold" }}>{race.raceName}</div>
                    <div style={{ color: "#a9adff", marginTop: "4px", fontSize: "13px" }}>
                      Round {race.round}
                    </div>
                  </div>

                  <strong>{totalPoints} pts</strong>
                </div>
              );
            })
        )}
      </section>

      <BottomNav />
    </main>
  );
}
