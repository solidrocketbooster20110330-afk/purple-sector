import BottomNav from "./components/BottomNav";
import NextSessionCountdown from "./components/NextSessionCountdown";

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

type Session = { date?: string; time?: string };

type Race = {
  raceName: string;
  date: string;
  time?: string;
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  SprintQualifying?: Session;
  Sprint?: Session;
  Qualifying?: Session;
};

type NewsItem = { title: string; link: string };

const API = {
  drivers: "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
  constructors: "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
  nextRace: "https://api.jolpi.ca/ergast/f1/current/next.json",
  calendar: "https://api.jolpi.ca/ergast/f1/current.json",
  news: "https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/content/fom-website/en/latest/all.xml",
  lastResult: "https://api.jolpi.ca/ergast/f1/current/last/results.json",
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 42%, #171025 100%)",
  color: "white",
  padding: "20px",
  paddingBottom: "90px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#101010",
  border: "1px solid #3a1217",
  borderRadius: "18px",
  padding: "15px",
};

const accent = "#7c3aed";
const red = "#ef233c";
const muted = "#b9b0b2";

async function getHomeData() {
  const responses = await Promise.all(Object.values(API).map((url) => fetch(url, { next: { revalidate: 900 } })));

  const [driversData, constructorsData, raceData, calendarData, newsData, resultData] =
    await Promise.all(
      responses.map(async (response) => {
        if (!response.ok) return null;
        try {
          return await response.json();
        } catch {
          return null;
        }
      })
    );

  return {
    drivers: driversData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [],
    constructors: constructorsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [],
    race: raceData?.MRData?.RaceTable?.Races?.[0] ?? null,
    calendar: calendarData?.MRData?.RaceTable?.Races ?? [],
    lastRace: resultData?.MRData?.RaceTable?.Races?.[0] ?? null,
    news: Array.isArray(newsData?.items) ? newsData.items.slice(0, 3) : [],
  };
}

function formatRaceDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getSessionTargetTime(date?: string, time?: string) {
  if (!date) return Number.NaN;
  return new Date(time ? `${date}T${time}` : `${date}T00:00:00Z`).getTime();
}

function getNextSession(races: Race[]) {
  const sessions: Array<{ label: string; raceName: string; targetTime: number }> = [];

  for (const race of races) {
    const sessionList: Array<[string, Session | undefined]> = [
      ["FP1", race.FirstPractice],
      ["Sprint Qualifying", race.SprintQualifying],
      ["FP2", race.SecondPractice],
      ["FP3", race.ThirdPractice],
      ["Qualifying", race.Qualifying],
      ["Sprint", race.Sprint],
      ["Race", { date: race.date, time: race.time }],
    ];

    for (const [label, session] of sessionList) {
      const targetTime = getSessionTargetTime(session?.date, session?.time);
      if (Number.isFinite(targetTime)) sessions.push({ label, raceName: race.raceName, targetTime });
    }
  }

  return (
    sessions
      .filter((session) => session.targetTime > Date.now())
      .sort((a, b) => a.targetTime - b.targetTime)[0] ?? null
  );
}

const detailLinkStyle = {
  color: accent,
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
};

export default async function HomePage() {
  const { drivers, constructors, race, calendar, lastRace, news } = await getHomeData();
  const winner = lastRace?.Results?.[0];
  const nextSession = getNextSession(calendar as Race[]);

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: "34px", margin: "0 0 5px" }}>
        <span style={{ color: red }}>●</span> PurpleSector
      </h1>

      <p style={{ color: muted, margin: "0 0 16px" }}>Formula 1 Dashboard</p>

      <a href="/search" style={{ display: "flex", alignItems: "center", gap: "10px", background: "#101010", border: "1px solid #3a1217", borderRadius: "16px", padding: "13px 15px", marginBottom: "14px", color: "#ddd4d6", textDecoration: "none", fontSize: "15px" }}>
        <span style={{ fontSize: "19px" }}>🔎</span>
        <span>Search drivers, teams, or Grands Prix</span>
      </a>

      {nextSession && (
        <>
          <NextSessionCountdown label={`🏎️ ${nextSession.label}`} raceName={nextSession.raceName} targetTime={nextSession.targetTime} />
          <a href="/schedule" style={{ ...cardStyle, display: "block", textDecoration: "none", color: "white", marginBottom: "14px" }}>
            <div style={{ color: red, fontSize: "12px", marginBottom: "8px", letterSpacing: "1px" }}>NEXT RACE</div>
            <div style={{ fontSize: "23px", lineHeight: 1.15, fontWeight: "bold" }}>{race?.raceName ?? "Next Race"}</div>
            {race?.date && <div style={{ marginTop: "6px", color: muted, fontSize: "13px" }}>{formatRaceDate(race.date)} →</div>}
          </a>
        </>
      )}

      {lastRace && winner && (
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <div style={{ color: red, fontSize: "12px", marginBottom: "6px", letterSpacing: "1px" }}>LAST RESULT</div>
          <div style={{ fontSize: "19px", fontWeight: "bold", marginBottom: "8px" }}>{lastRace.raceName}</div>
          <div style={{ fontSize: "14px" }}>🏆 {winner.Driver.givenName} {winner.Driver.familyName}</div>
          <a href="/results" style={{ color: accent, textDecoration: "none", display: "inline-block", marginTop: "10px" }}>View Results →</a>
        </div>
      )}

      <section style={{ ...cardStyle, marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
          <h2 style={{ margin: 0 }}>Drivers</h2>
          <a href="/championship" style={detailLinkStyle}>View Detail →</a>
        </div>
        {drivers.slice(0, 5).map((driver: DriverStanding) => (
          <div key={driver.position} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #251317" }}>
            <span>{driver.position}. {driver.Driver.familyName}</span>
            <strong>{driver.points}</strong>
          </div>
        ))}
      </section>

      <section style={{ ...cardStyle, marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
          <h2 style={{ margin: 0 }}>Constructors</h2>
          <a href="/championship/constructors" style={detailLinkStyle}>View Detail →</a>
        </div>
        {constructors.slice(0, 5).map((team: ConstructorStanding) => (
          <div key={team.position} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #251317" }}>
            <span>{team.position}. {team.Constructor.name}</span>
            <strong>{team.points}</strong>
          </div>
        ))}
      </section>

      <section style={cardStyle}>
        <h2>Latest News</h2>
        {news.map((item: NewsItem) => (
          <a key={item.link} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", color: "white", textDecoration: "none", marginBottom: "12px" }}>
            • {item.title}
          </a>
        ))}
        <a href="/news" style={{ color: accent, textDecoration: "none", fontWeight: "bold" }}>More News →</a>
      </section>

      <BottomNav />
    </main>
  );
}
