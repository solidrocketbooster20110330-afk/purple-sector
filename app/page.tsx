import BottomNav from "./components/BottomNav";

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
    resultRes,
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

    fetch(
      "https://api.jolpi.ca/ergast/f1/current/last/results.json",
      {
        next: { revalidate: 3600 },
      }
    ),
  ]);

  const driversData = await driversRes.json();
  const constructorsData = await constructorsRes.json();
  const raceData = await raceRes.json();
  const newsData = await newsRes.json();
  const resultData = await resultRes.json();

  const drivers =
    driversData.MRData.StandingsTable
      .StandingsLists[0].DriverStandings;

  const constructors =
    constructorsData.MRData.StandingsTable
      .StandingsLists[0].ConstructorStandings;

  const race: Race =
    raceData.MRData.RaceTable.Races[0];

  const lastRace =
    resultData.MRData.RaceTable.Races[0];

  const winner = lastRace.Results[0];

  const news: NewsItem[] =
    newsData.items?.slice(0, 3) || [];

  const raceDate = new Date(race.date);

  const raceDateText =
    raceDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const card = {
    background: "#11152f",
    border: "1px solid #2b347a",
    borderRadius: "18px",
    padding: "18px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#05071f 0%,#090d28 100%)",
        color: "white",
        padding: "20px",
        paddingBottom: "90px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "38px",
          marginBottom: "5px",
        }}
      >
        🟣 PurpleSector
      </h1>

      <p
        style={{
          color: "#9fa7ff",
          marginBottom: "20px",
        }}
      >
        Formula 1 Dashboard
      </p>

      <a
        href="/schedule"
        style={{
          ...card,
          display: "block",
          textDecoration: "none",
          color: "white",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            color: "#9fa7ff",
            fontSize: "13px",
            marginBottom: "8px",
          }}
        >
          NEXT RACE
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          {race.raceName}
        </div>

        <div
          style={{
            marginTop: "8px",
            color: "#c7cbff",
          }}
        >
          {raceDateText} →
        </div>
      </a>

      <div
        style={{
          ...card,
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            color: "#9fa7ff",
            fontSize: "13px",
            marginBottom: "8px",
          }}
        >
          LAST RESULT
        </div>

        <div
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          {lastRace.raceName}
        </div>

        <div>
          🏆 {winner.Driver.givenName}{" "}
          {winner.Driver.familyName}
        </div>

        <a
          href="/results"
          style={{
            color: "#a855f7",
            textDecoration: "none",
            display: "inline-block",
            marginTop: "10px",
          }}
        >
          View Results →
        </a>
      </div>

      <div
        style={{
          ...card,
          marginBottom: "20px",
        }}
      >
        <h2>Drivers</h2>

        {drivers.slice(0, 5).map((d: DriverStanding) => (
          <div
            key={d.position}
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              padding: "8px 0",
            }}
          >
            <span>
              {d.position}.{" "}
              {d.Driver.familyName}
            </span>

            <strong>{d.points}</strong>
          </div>
        ))}
      </div>

      <div
        style={{
          ...card,
          marginBottom: "20px",
        }}
      >
        <h2>Constructors</h2>

        {constructors
          .slice(0, 5)
          .map(
            (
              team: ConstructorStanding
            ) => (
              <div
                key={team.position}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  padding: "8px 0",
                }}
              >
                <span>
                  {team.position}.{" "}
                  {
                    team.Constructor
                      .name
                  }
                </span>

                <strong>
                  {team.points}
                </strong>
              </div>
            )
          )}
      </div>

      <div style={card}>
        <h2>Latest News</h2>

        {news.map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              color: "white",
              textDecoration: "none",
              marginBottom: "12px",
            }}
          >
            • {item.title}
          </a>
        ))}

        <a
          href="/news"
          style={{
            color: "#a855f7",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          More News →
        </a>
      </div>

      <BottomNav />
    </main>
  );
}
