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
        background: "#2b2f33",
        color: "#f2f2f2",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginTop: 0 }}>🏆 Drivers Championship</h1>

      <a
        href="/championship"
        style={{
          display: "inline-block",
          color: "white",
          textDecoration: "none",
          background: "#7c3aed",
          padding: "10px 16px",
          borderRadius: "12px",
          margin: "12px 0 20px",
        }}
      >
        ← Championship
      </a>

      <div
        style={{
          background: "#3a3f45",
          border: "1px solid #5a6169",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        {drivers.map((driver, index) => (
          <div
            key={driver.position}
            style={{
              padding: "14px 0",
              borderBottom:
                index === drivers.length - 1
                  ? "none"
                  : "1px solid #555b62",
            }}
          >
            <strong style={{ marginRight: "10px" }}>
              {driver.position === "1"
                ? "🥇"
                : driver.position === "2"
                ? "🥈"
                : driver.position === "3"
                ? "🥉"
                : "P" + driver.position}
            </strong>
            {"#" + (driver.Driver.permanentNumber ?? "-") + " "}
            {driver.Driver.givenName} {driver.Driver.familyName}
            <div style={{ color: "#d7dadd", marginTop: "4px" }}>
              {driver.Constructors[0]?.name ?? "-"}
            </div>
            <div style={{ marginTop: "4px" }}>{driver.points} pts</div>
          </div>
        ))}
      </div>
    </main>
  );
}
