import { displayDriverName } from "../lib/f1Display";
import HomeRaceCard from "./components/HomeRaceCard";
import HomeFavorites from "./components/HomeFavorites";

type DriverStanding = { position: string; points: string; Driver: { driverId: string; givenName: string; familyName: string }; Constructors?: { name: string }[] };
type ConstructorStanding = { position: string; points: string; Constructor: { constructorId: string; name: string } };
type Session = { date?: string; time?: string };
type LastWinner = { driverName: string; constructorName: string; raceName: string } | null;
type Race = {
  raceName: string; date: string; time?: string;
  Circuit?: { circuitName?: string; Location?: { locality?: string; country?: string } };
  FirstPractice?: Session; SecondPractice?: Session; ThirdPractice?: Session;
  SprintQualifying?: Session; Sprint?: Session; Qualifying?: Session;
};

const API = {
  drivers: "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
  constructors: "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
  calendar: "https://api.jolpi.ca/ergast/f1/current.json",
  lastResult: "https://api.jolpi.ca/ergast/f1/current/last/results.json",
};
const teamColors: Record<string, string> = {
  Mercedes: "#00a19c", Ferrari: "#e80020", "Red Bull": "#3671c6", "Red Bull Racing": "#3671c6",
  McLaren: "#ff8000", "Aston Martin": "#00665e", Alpine: "#ff87bc", "Alpine F1 Team": "#ff87bc",
  Williams: "#64c4ff", "Racing Bulls": "#6692ff", "Visa Cash App RB": "#6692ff",
  Haas: "#e6002b", "Haas F1 Team": "#e6002b",
};
async function fetchJsonOrNull(url: string) {
  try {
    const response = await fetch(url, {
      next: { revalidate: 900 },
      headers: {
        Accept: "application/json",
        "User-Agent": "PurpleSector/1.0 (F1 information website)",
      },
    });
    if (!response.ok) {
      console.error("Home data request failed:", response.status, url);
      return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error("Home data returned non-JSON response:", contentType, url);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Home data fetch error:", url, error);
    return null;
  }
}
function getSessionTime(session?: Session) {
  if (!session?.date) return Number.NaN;
  return new Date(session.time ? `${session.date}T${session.time}` : `${session.date}T00:00:00Z`).getTime();
}
async function getHomeData() {
  const [driversData, constructorsData, calendarData, lastResultData] = await Promise.all(Object.values(API).map(fetchJsonOrNull));
  const calendar: Race[] = calendarData?.MRData?.RaceTable?.Races ?? [];
  const now = Date.now();
  const race = calendar.find((item) => getSessionTime({ date: item.date, time: item.time }) >= now) ?? null;
  const lastRace = lastResultData?.MRData?.RaceTable?.Races?.[0];
  const winner = lastRace?.Results?.[0];
  const lastWinner: LastWinner = winner?.Driver && winner?.Constructor
    ? {
        driverName: winner.Driver.givenName + " " + winner.Driver.familyName,
        constructorName: winner.Constructor.name,
        raceName: lastRace.raceName ?? "지난 그랑프리",
      }
    : null;
  return {
    drivers: driversData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [],
    constructors: constructorsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [],
    race,
    lastWinner,
  };
}
const cardStyle = {
  background: "linear-gradient(135deg,rgba(104,72,160,0.24),rgba(255,255,255,0.055) 55%,rgba(85,55,130,0.16))",
  border: "1px solid rgba(205,180,255,0.18)", borderRadius: "22px", padding: "18px 16px",
  backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
  marginBottom: "16px", boxShadow: "0 14px 30px #0007",
};
const muted = "#aaa5ad";

export default async function HomePage() {
  const { drivers, constructors, race, lastWinner } = await getHomeData();
  const driverLeaderPoints = Number(drivers[0]?.points ?? 0);
  const constructorLeaderPoints = Number(constructors[0]?.points ?? 0);
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(155deg,#090710 0%,#160d25 35%,#24143b 72%,#0a0810 100%)", color: "white", padding: "20px 14px 90px", fontFamily: "Arial, sans-serif" }}>
      <HomeFavorites />
      {race ? (
        <HomeRaceCard race={race} lastWinner={lastWinner} />
      ) : (
        <section style={{ ...cardStyle, color: "#d8d1e3" }}>
          <strong style={{ fontSize: "18px" }}>🏁 다음 그랑프리</strong>
          <p style={{ marginBottom: 0, fontSize: "13px", lineHeight: 1.6 }}>
            일정 정보를 불러오지 못했습니다. 데이터 제공 서버의 응답을 확인 중입니다.
          </p>
        </section>
      )}
      <section style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 4px 12px" }}>
          <h2 style={{ margin: 0, fontSize: "21px", fontWeight: 850 }}>챔피언십 순위</h2>
          <a href="/championship" style={{ color: muted, textDecoration: "none", fontSize: "14px" }}>전체 보기 ›</a>
        </div>
        <div style={cardStyle}>
          <div style={{ color: muted, fontSize: "13px", margin: "0 4px 10px" }}>드라이버</div>
          <div style={{ display: "grid", gap: "7px" }}>
            {drivers.length === 0 && <p style={{ color: muted, fontSize: "13px" }}>드라이버 포인트 정보를 불러오지 못했습니다.</p>}
            {drivers.slice(0, 5).map((driver: DriverStanding, index: number) => {
              const points = Number(driver.points);
              const gap = Math.round(points - driverLeaderPoints);
              const fill = driverLeaderPoints > 0 ? Math.max(0, Math.min(100, points / driverLeaderPoints * 100)) : 0;
              const driverTeam = driver.Constructors?.[0]?.name ?? "";
              const driverColor = teamColors[driverTeam] ?? "#7c3aed";
              return (
                <a key={driver.Driver.driverId} href={`/championship/${driver.Driver.driverId}`} style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px", minHeight: "48px", padding: "0 12px", borderRadius: "12px", overflow: "hidden", color: "white", textDecoration: "none", background: "#ffffff0d" }}>
                  <span style={{ position: "absolute", inset: "0 auto 0 0", width: `${fill}%`, background: `linear-gradient(90deg,${driverColor}dd,${driverColor}77)`, borderRadius: "12px" }} />
                  <strong style={{ position: "relative", zIndex: 1, width: "18px", fontSize: "16px" }}>{index + 1}</strong>
                  <span style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0, fontSize: "14px", fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayDriverName(driver.Driver.givenName, driver.Driver.familyName)}</span>
                  {index > 0 && <span style={{ position: "relative", zIndex: 1, color: "#c6c0c8", fontSize: "12px" }}>{gap}</span>}
                  <strong style={{ position: "relative", zIndex: 1, fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>{driver.points}<small style={{ fontSize: "10px", color: "#d2cbd4", marginLeft: "4px" }}>PTS</small></strong>
                </a>
              );
            })}
          </div>
          <div style={{ color: muted, fontSize: "13px", margin: "20px 4px 10px" }}>컨스트럭터</div>
          <div style={{ display: "grid", gap: "7px" }}>
            {constructors.length === 0 && <p style={{ color: muted, fontSize: "13px" }}>컨스트럭터 포인트 정보를 불러오지 못했습니다.</p>}
            {constructors.slice(0, 5).map((team: ConstructorStanding, index: number) => {
              const points = Number(team.points);
              const gap = Math.round(points - constructorLeaderPoints);
              const fill = constructorLeaderPoints > 0 ? Math.max(0, Math.min(100, points / constructorLeaderPoints * 100)) : 0;
              const color = teamColors[team.Constructor.name] ?? "#0d8178";
              return (
                <a key={team.Constructor.constructorId} href={`/championship/constructors/${team.Constructor.constructorId}`} style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px", minHeight: "48px", padding: "0 12px", borderRadius: "12px", overflow: "hidden", color: "white", textDecoration: "none", background: "#ffffff0d" }}>
                  <span style={{ position: "absolute", inset: "0 auto 0 0", width: `${fill}%`, background: `linear-gradient(90deg,${color}bb,${color}66)`, borderRadius: "12px" }} />
                  <strong style={{ position: "relative", zIndex: 1, width: "18px", fontSize: "16px" }}>{index + 1}</strong>
                  <span style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0, fontSize: "14px", fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.Constructor.name}</span>
                  {index > 0 && <span style={{ position: "relative", zIndex: 1, color: "#c6c0c8", fontSize: "12px" }}>{gap}</span>}
                  <strong style={{ position: "relative", zIndex: 1, fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>{team.points}<small style={{ fontSize: "10px", color: "#d2cbd4", marginLeft: "4px" }}>PTS</small></strong>
                </a>
              );
            })}
          </div>
        </div>
      </section>
      
    </main>
  );
}
