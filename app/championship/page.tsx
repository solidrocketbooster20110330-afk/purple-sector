import Link from "next/link";
import BottomNav from "../components/BottomNav";

type DriverStanding = {
  position: string;
  points: string;
  Driver: {
    givenName: string;
    familyName: string;
    permanentNumber?: string;
  };
  Constructors: {
    name: string;
  }[];
};

export default async function ChampionshipDriversPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
    { next: { revalidate: 3600 } }
  );

  const data = await res.json();
  const drivers: DriverStanding[] =
    data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "24px",
          marginBottom: "20px",
        }}
      >
        <Link
          href="/championship"
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "16px",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: "bold",
            background: "#7c3aed",
            border: "1px solid #2b347a",
            color: "white",
          }}
        >
          👤 Drivers
        </Link>

        <Link
          href="/championship/constructors"
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "16px",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: "bold",
            background: "#131942",
            border: "1px solid #2b347a",
            color: "white",
          }}
        >
          🏭 Constructors
        </Link>
      </div>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        {drivers.map((driver) => (
          <div
            key={driver.position}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #2b347a",
            }}
          >
            <strong>
              {driver.position === "1"
                ? "🥇"
                : driver.position === "2"
                ? "🥈"
                : driver.position === "3"
                ? "🥉"
                : `P${driver.position}`}
            </strong>

            <div>
              #{driver.Driver.permanentNumber ?? "-"}{" "}
              {driver.Driver.givenName} {driver.Driver.familyName}
            </div>

            <div style={{ color: "#a9adff" }}>
              {driver.Constructors[0]?.name ?? "Unknown Team"}
            </div>

            <div>{driver.points} pts</div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
