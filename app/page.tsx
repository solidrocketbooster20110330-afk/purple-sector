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

type NewsItem = {
  title: string;
  link: string;
};

export default async function HomePage() {
  const [
    driversRes,
    constructorsRes,
    raceRes,
    newsRes,
  ] = await Promise.all([
    fetch(
      "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
      {
        next: { revalidate: 3600 },
      }
    ),

    fetch(
      "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
      {
        next: { revalidate: 3600 },
      }
    ),

    fetch(
      "https://api.jolpi.ca/ergast/f1/current/next.json",
      {
        next: { revalidate: 3600 },
      }
    ),

    fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/content/fom-website/en/latest/all.xml",
      {
        next: { revalidate: 3600 },
      }
    ),
  ]);

  const driversData = await driversRes.json();
  const constructorsData = await constructorsRes.json();
  const raceData = await raceRes.json();
  const newsData = await newsRes.json();

  const drivers: DriverStanding[] =
    driversData.MRData.StandingsTable.StandingsLists[0]
      .DriverStandings;

  const constructors: ConstructorStanding[] =
    constructorsData.MRData.StandingsTable.StandingsLists[0]
      .ConstructorStandings;

  const race: Race =
    raceData.MRData.RaceTable.Races[0];

  const news: NewsItem[] =
    newsData.items?.slice(0, 3) || [];

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
        background:
          "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "40px",
        paddingBottom: "100px",
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

      {/* NEXT RACE */}

      <a
        href="/schedule"
        style={{
          ...cardStyle,
          textDecoration: "none",
          color: "white",
          display: "block",
          marginBottom: "20px",
        }}
      >
        <h2>🏁 NEXT RACE →</h2>

        <h3>{race.raceName}</h3>

        <p>{race.date}</p>

        <p>{race.Circuit.circuitName}</p>
      </a>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(320px,1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h2>👨‍🏎️ Driver Standings</h2>

          <div style={{ lineHeight: "2" }}>
            {drivers
              .slice(0, 5)
              .map((driver) => (
                <div key={driver.position}>
                  {driver.position}.{" "}
                  {driver.Driver.givenName}{" "}
                  {driver.Driver.familyName} —{" "}
                  {driver.points}
                </div>
              ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2>🏆 Constructor Standings</h2>

          <div style={{ lineHeight: "2" }}>
            {constructors
              .slice(0, 5)
              .map((team) => (
                <div key={team.position}>
                  {team.position}.{" "}
                  {team.Constructor.name} —{" "}
                  {team.points}
                </div>
              ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2>📰 Latest News</h2>

          <div style={{ lineHeight: "2" }}>
            {news.length > 0 ? (
              news.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  • {item.title}
                </a>
              ))
            ) : (
              <div>No news available</div>
            )}
          </div>

          <a
            href="/news"
            style={{
              color: "#a9adff",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
              marginTop: "10px",
            }}
          >
            More News →
          </a>
        </div>
      </div>

      {/* BOTTOM NAV */}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#131942",
          borderTop: "1px solid #2b347a",
          display: "flex",
          justifyContent: "space-around",
          padding: "16px 0",
          zIndex: 999,
        }}
      >
        <a
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          🏠 Home
        </a>

        <a
          href="/results"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          🏁 Results
        </a>

        <a
          href="/schedule"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          📅 Schedule
        </a>
      </div>
    </main>
  );
}
