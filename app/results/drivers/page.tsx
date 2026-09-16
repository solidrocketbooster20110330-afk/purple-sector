type DriverStanding = {
  position: string;
  points: string;
  wins: string;

  Driver: {
    givenName: string;
    familyName: string;
  };
};

export default async function DriversPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
    {
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();

  const drivers: DriverStanding[] =
    data.MRData.StandingsTable.StandingsLists[0]
      .DriverStandings;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <a href="/results">Race</a>
        <a href="/results/drivers">Drivers</a>
        <a href="/results/constructors">
          Constructors
        </a>
      </div>

      <h1>👨‍🏎️ Driver Championship</h1>

      {drivers.map((driver) => (
        <div
          key={driver.position}
          style={{
            background: "#131942",
            padding: "15px",
            marginTop: "10px",
            borderRadius: "12px",
          }}
        >
          {driver.position}.{" "}
          {driver.Driver.givenName}{" "}
          {driver.Driver.familyName}
          {" — "}
          {driver.points} pts
        </div>
      ))}
    </main>
  );
}
