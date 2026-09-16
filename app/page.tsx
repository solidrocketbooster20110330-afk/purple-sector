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

  const raceDate = new Date(race.date);

  const raceDateText = raceDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );

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
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          fontWeight: "bold",
          marginBottom: "6px",
        }}
      >
        🟣 PurpleSector
      </h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "25px",
        }}
      >
        Formula 1 Dashboard
      </p>

      <a
        href="/schedule"
        style={{
          ...cardStyle,
          display: "block",
          textDecoration: "none",
          color: "white",
          marginBottom: "20px",
          padding: "28px",
        }}
      >
        <div
          style={{
            color: "#a9adff",
            fontSize: "14px",
            marginBottom: "8px",
          }}
        >
          NEXT RACE
        </div>

        <div
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          {race.raceName}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#c7cbff",
          }}
        >
          <span>{raceDateText}</span>
          <span>→</span>
        </div>
      </a>

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h2>👨‍🏎️ Driver Standings</h2>

          <div style={{ lineHeight: "2" }}>
            {drivers.slice(0, 5).map((driver) => (
              <div key={driver.position}>
                {driver.position}.{" "}
                {driver.Driver.familyName}
                {" — "}
                {driver.points}
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2>🏆 Constructor Standings</h2>

          <div style={{ lineHeight: "2" }}>
            {constructors.slice(0, 5).map((team) => (
              <div key={team.position}>
                {team.position}.{" "}
                {team.Constructor.name}
                {" — "}
                {team.points}
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2>📰 Latest News</h2>

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
                  marginBottom: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                • {item.title}
              </a>
            ))
          ) : (
            <div>No news available</div>
          )}

          <a
            href="/news"
            style={{
              color: "#a9adff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            More News →
          </a>
        </div>
      </div>

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
            color: "#a855f7",
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
