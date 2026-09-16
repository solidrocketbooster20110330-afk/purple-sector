type DriverStanding = {
  position: string;
  points: string;
  Driver: {
    givenName: string;
    familyName: string;
  };
};

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: {
    name: string;
  };
};

type Race = {
  raceName: string;
  Circuit: {
    circuitName: string;
  };
  date: string;
};

export default async function HomePage() {
  const [driversRes, constructorsRes, raceRes] = await Promise.all([
    fetch("https://api.jolpi.ca/ergast/f1/current/driverstandings.json", {
      next: { revalidate: 3600 },
    }),
    fetch("https://api.jolpi.ca/ergast/f1/current/constructorstandings.json", {
      next: { revalidate: 3600 },
    }),
    fetch("https://api.jolpi.ca/ergast/f1/current/next.json", {
      next: { revalidate: 3600 },
    }),
  ]);

  const driversData = await driversRes.json();
  const constructorsData = await constructorsRes.json();
  const raceData = await raceRes.json();

  const drivers: DriverStanding[] =
    driversData.MRData.StandingsTable.StandingsLists[0].DriverStandings;

  const constructors: ConstructorStanding[] =
    constructorsData.MRData.StandingsTable.StandingsLists[0]
      .ConstructorStandings;

  const race: Race = raceData.MRData.RaceTable.Races[0];

  const navBtn = {
    background: "#131942",
    border: "1px solid #2b347a",
    borderRadius: "12px",
    padding: "10px 18px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-block",
  };

  const cardStyle = {
    background: "#131942",
    border: "1px solid #2b347a",
    borderRadius: "20px",
    padding: "20px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "56px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        🟣 PurpleSector
      </h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "30px",
        }}
      >
        Ultimate Formula 1 Dashboard
      </p>

      <nav
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <a href="/" style={navBtn}>🏠 Home</a>
        <a href="/schedule" style={navBtn}>📅 Schedule</a>
        <a href="/standings" style={navBtn}>🏆 Standings</a>
        <a href="/constructors" style={navBtn}>🏁 Constructors</a>
        <a href="/news" style={navBtn}>📰 News</a>
        <a href="/results" style={navBtn}>🏎️ Results</a>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h2>🏁 Next Race</h2>
          <h3>{race.raceName}</h3>
          <p>📅 {race.date}</p>
          <p>📍 {race.Circuit.circuitName}</p>
        </div>

        <div style={cardStyle}>
          <h2>👨‍🏎️ Driver Standings</h2>

          <div style={{ lineHeight: "2" }}>
            {drivers.slice(0, 5).map((driver) => (
              <div key={driver.position}>
                {driver.position}. {driver.Driver.givenName}{" "}
                {driver.Driver.familyName} — {driver.points}
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2>🏆 Constructor Standings</h2>

          <div style={{ lineHeight: "2" }}>
            {constructors.slice(0, 5).map((team) => (
              <div key={team.position}>
                {team.position}. {team.Constructor.name} — {team.points}
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2>📰 Latest News</h2>
          <div style={{ lineHeight: "2" }}>
            <div>🚧 News API coming soon</div>
            <div>🏎️ PurpleSector development in progress</div>
            <div>🟣 Live standings now enabled</div>
          </div>
        </div>
      </div>
    </main>
  );
}
