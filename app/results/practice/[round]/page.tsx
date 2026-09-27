import BottomNav from "../../../components/BottomNav";
import ResultsTabs from "../../ResultsTabs";

type Session = {
  session_key: number;
  session_name: string;
  session_type?: string;
  date_start: string;
  date_end?: string;
  country_name?: string;
  location?: string;
  year?: number;
  is_cancelled?: boolean;
};

type SessionResult = {
  position: number;
  driver_number: number;
};

type Driver = {
  driver_number: number;
  full_name: string;
  team_name: string;
};

export default async function Practice1Page() {
  let mergedResults: Array<{
    position: number;
    driver_number: number;
    full_name: string;
    team_name: string;
  }> = [];

  let raceName = "Latest Practice 1";

  try {
    const sessionRes = await fetch(
      "https://api.openf1.org/v1/sessions",
      { cache: "no-store" }
    );

    const sessionsData = await sessionRes.json();
    const sessions: Session[] = Array.isArray(sessionsData)
      ? sessionsData
      : [];

    const candidates = sessions
      .filter(
        (s) =>
          s.session_name === "Practice 1" &&
          s.session_type === "Practice" &&
          (s.year ?? 0) >= 2025 &&
          !s.is_cancelled
      )
      .sort(
        (a, b) =>
          new Date(b.date_start).getTime() -
          new Date(a.date_start).getTime()
      );

    for (const session of candidates) {
      try {
        const resultsRes = await fetch(
          `https://api.openf1.org/v1/session_result?session_key=${session.session_key}`,
          { cache: "no-store" }
        );

        if (!resultsRes.ok) continue;

        const resultsData = await resultsRes.json();
        const results: SessionResult[] = Array.isArray(resultsData)
          ? resultsData
          : [];

        if (results.length === 0) continue;

        const driversRes = await fetch(
          `https://api.openf1.org/v1/drivers?session_key=${session.session_key}`,
          { cache: "no-store" }
        );

        const driversData = driversRes.ok
          ? await driversRes.json()
          : [];

        const drivers: Driver[] = Array.isArray(driversData)
          ? driversData
          : [];

        mergedResults = results
          .filter((result) => Number.isFinite(result.position))
          .sort((a, b) => a.position - b.position)
          .map((result) => {
            const driver = drivers.find(
              (d) => d.driver_number === result.driver_number
            );

            return {
              position: result.position,
              driver_number: result.driver_number,
              full_name:
                driver?.full_name ?? `Driver #${result.driver_number}`,
              team_name:
                driver?.team_name ?? "Unknown Team",
            };
          });

        raceName = session.country_name
          ? `${session.country_name} • Practice 1`
          : `${session.location ?? "Latest"} • Practice 1`;

        break;
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error(error);
  }

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
      <h1>🛠 Practice 1 Results</h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "20px",
        }}
      >
        {raceName}
      </p>

      <ResultsTabs />

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        {mergedResults.length === 0 ? (
          <p>Practice 1 데이터 없음</p>
        ) : (
          mergedResults.map((driver) => (
            <div
              key={driver.driver_number}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #2b347a",
              }}
            >
              <strong>P{driver.position}</strong>

              <div>
                #{driver.driver_number} {driver.full_name}
              </div>

              <div style={{ color: "#a9adff" }}>
                {driver.team_name}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
