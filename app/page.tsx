import BottomNav from "./components/BottomNav";

type DriverStanding = {
  position: string;
  points: string;
  Driver: { givenName: string; familyName: string };
};

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: { name: string };
};

type Race = { raceName: string; date: string };

type NewsItem = { title: string; link: string };

const API = {
  drivers:
    "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
  constructors:
    "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
  nextRace: "https://api.jolpi.ca/ergast/f1/current/next.json",
  news:
    "https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/content/fom-website/en/latest/all.xml",
  lastResult: "https://api.jolpi.ca/ergast/f1/current/last/results.json",
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#05071f 0%,#090d28 100%)",
  color: "white",
  padding: "20px",
  paddingBottom: "90px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#11152f",
  border: "1px solid #2b347a",
  borderRadius: "18px",
  padding: "18px",
};

const accent = "#9fa7ff";

async function getHomeData() {
  const [driversRes, constructorsRes, raceRes, newsRes, resultRes] =
    await Promise.all(
      Object.values(API).map((url) =>
        fetch(url, { next: { revalidate: 3600 } })
      )
    );

  const [
    driversData,
    constructorsData,
    raceData,
    newsData,
    resultData,
  ] = await Promise.all(
    [driversRes, constructorsRes, raceRes, newsRes, resultRes].map(
      (response) => response.json()
    )
  );

  return {
    drivers:
      driversData?.MRData?.StandingsTable?.StandingsLists?.[0]
        ?.DriverStandings ?? [],
    constructors:
      constructorsData?.MRData?.StandingsTable?.StandingsLists?.[0]
        ?.ConstructorStandings ?? [],
    race: raceData?.MRData?.RaceTable?.Races?.[0] ?? null,
    lastRace: resultData?.MRData?.RaceTable?.Races?.[0] ?? null,
    news: newsData?.items?.slice(0, 3) ?? [],
  };
}

function formatRaceDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const detailLinkStyle = {
  color: "#a855f7",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
};

export default async function HomePage() {
  const { drivers, constructors, race, lastRace, news } =
    await getHomeData();

  const winner = lastRace?.Results?.[0];

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: "38px", margin: "0 0 5px" }}>
        🟣 PurpleSector
      </h1>

      <p style={{ color: accent, margin: "0 0 20px" }}>
        Formula 1 Dashboard
      </p>

      {race && (
        <a
          href="/schedule"
          style={{
            ...cardStyle,
            display: "block",
            textDecoration: "none",
            color: "white",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              color: accent,
              fontSize: "13px",
              marginBottom: "8px",
            }}
          >
            NEXT RACE
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold" }}>
            {race.raceName}
          </div>
          <div style={{ marginTop: "8px", color: "#c7cbff" }}>
            {formatRaceDate(race.date)} →
          </div>
        </a>
      )}

      {lastRace && winner && (
        <div style={{ ...cardStyle, marginBottom: "20px" }}>
          <div
            style={{
              color: accent,
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
            🏆 {winner.Driver.givenName} {winner.Driver.familyName}
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
      )}

      <section style={{ ...cardStyle, marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <h2 style={{ margin: 0 }}>Drivers</h2>
          <a href="/championship" style={detailLinkStyle}>
            View Detail →
          </a>
        </div>

        {drivers.slice(0, 5).map((driver: DriverStanding) => (
          <div
            key={driver.position}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
            }}
          >
            <span>
              {driver.position}. {driver.Driver.familyName}
            </span>
            <strong>{driver.points}</strong>
          </div>
        ))}
      </section>

      <section style={{ ...cardStyle, marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <h2 style={{ margin: 0 }}>Constructors</h2>
          <a href="/championship/constructors" style={detailLinkStyle}>
            View Detail →
          </a>
        </div>

        {constructors.slice(0, 5).map(
          (team: ConstructorStanding) => (
            <div
              key={team.position}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <span>
                {team.position}. {team.Constructor.name}
              </span>
              <strong>{team.points}</strong>
            </div>
          )
        )}
      </section>

      <section style={cardStyle}>
        <h2>Latest News</h2>
        {news.map((item: NewsItem) => (
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
      </section>

      <BottomNav />
    </main>
  );
}
