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
  duration?: number;
  gap_to_leader?: number;
  number_of_laps?: number;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
};

type Driver = {
  driver_number: number;
  full_name: string;
  team_name: string;
};



export default async function Practice1Page() {
  let results: SessionResult[] = [];
  let drivers: Driver[] = [];
  let sessionTitle = "Latest Practice 1";

  try {
    const sessionsRes = await fetch(
      "https://api.openf1.org/v1/sessions",
      { cache: "no-store" }
    );

    if (!sessionsRes.ok) throw new Error("Failed to load sessions");

    const sessionsData = await sessionsRes.json();
    const sessions: Session[] = Array.isArray(sessionsData) ? sessionsData : [];

    const candidates = sessions
      .filter(
        (s) =>
          s.session_name === "Practice 1" &&
          (s.year ?? 0) >= 2025 &&
          !s.is_cancelled
      )
      .sort(
        (a, b) =>
          new Date(b.date_start).getTime() -
          new Date(a.date_start).getTime()
      );

    for (const session of candidates) {
      const res = await fetch(
        `https://api.openf1.org/v1/session_result?session_key=${session.session_key}`,
        { cache: "no-store" }
      );
      if (!res.ok) continue;

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;

      const driverRes = await fetch(
        `https://api.openf1.org/v1/drivers?session_key=${session.session_key}`,
        { cache: "no-store" }
      );
      const driverData = driverRes.ok ? await driverRes.json() : [];

      results = data
        .filter((r) => Number.isFinite(r.position))
        .sort((a, b) => a.position - b.position);

      drivers = Array.isArray(driverData) ? driverData : [];

      sessionTitle = `${session.country_name ?? session.location ?? "Latest"} • Practice 1`;
      break;
    }
  } catch (error) {
    console.error("Practice 1 error:", error);
  }

  const rows = results.map((result) => {
    const driver = drivers.find(
      (d) => d.driver_number === result.driver_number
    );
    return {
      ...result,
      full_name: driver?.full_name ?? `Driver #${result.driver_number}`,
      team_name: driver?.team_name ?? "Unknown Team",
    };
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1>🛠 Practice 1 Results</h1>
      <p style={{ color: "#a9adff", marginBottom: "20px" }}>{sessionTitle}</p>

      <ResultsTabs />

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
          overflowX: "auto",
        }}
      >
        {rows.length === 0 ? (
          <p>Practice 1 데이터 없음</p>
        ) : (
        {results.map((driver) => (
          <div
            key={driver.driver_number}
            style={{
              display: "grid",
              gridTemplateColumns: "56px 56px 1fr",
              gap: "10px",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid #2b347a",
            }}
          >
            <strong>P{driver.position}</strong>
            <strong>#{driver.driver_number}</strong>
            <div>
              <div>{driver.full_name}</div>
              <div style={{ color: "#a9adff", fontSize: "14px", marginTop: "3px" }}>
                {driver.team_name}
              </div>
            </div>
          </div>
        ))})
      </div>

      <BottomNav />
    </main>
  );
}
