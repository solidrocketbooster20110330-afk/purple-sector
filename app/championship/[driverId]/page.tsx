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
                  <strong>{positionLabel(result?.position)}</strong>

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
