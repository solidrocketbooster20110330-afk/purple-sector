import Link from "next/link";
import BottomNav from "../components/BottomNav";
import PointsGraph from "../components/PointsGraph";

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
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();

  const drivers: DriverStanding[] =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

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

      <section
        style={{
          marginTop: "20px",
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "18px",
          padding: "16px",
        }}
      >
        <h2 style={{ margin: "0 0 8px" }}>📈 Points Graph</h2>
        <p style={{ color: "#a9adff", margin: 0, fontSize: "13px" }}>
          현재 챔피언십 포인트 비교
        </p>
      </section>
      <BottomNav />
    </main>
  );
}
