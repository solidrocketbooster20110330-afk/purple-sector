import BottomNav from "../../../components/BottomNav";
import ResultsTabs from "../../ResultsTabs";

type OpenF1Session = {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end?: string;
  country_name?: string;
  location?: string;
  year?: number;
  is_cancelled?: boolean;
};

type OpenF1Result = {
  position: number;
  driver_number: number;
  duration?: number;
  gap_to_leader?: number;
  number_of_laps?: number;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
};

type OpenF1Driver = {
  driver_number: number;
  full_name: string;
  team_name: string;
};

export default async function Practice1Page() {
  let results: OpenF1Result[] = [];
  let drivers: OpenF1Driver[] = [];
  let sessionTitle = "Latest Practice 1";

  try {
    const sessionsRes = await fetch(
      "https://api.openf1.org/v1/sessions",
      { cache: "no-store" }
    );

    if (!sessionsRes.ok) {
      throw new Error("Failed to load OpenF1 sessions");
    }

    const sessionsData = await sessionsRes.json();
    const sessions: OpenF1Session[] = Array.isArray(sessionsData)
      ? sessionsData
      : [];

    const candidates = sessions
      .filter(
        (session) =>
          session.session_name === "Practice 1" &&
          (session.year ?? 0) >= 2025 &&
          !session.is_cancelled
      )
      .sort(
        (a, b) =>
          new Date(b.date_start).getTime() -
          new Date(a.date_start).getTime()
      );

    for (const session of candidates) {
      try {
        const resultRes = await fetch(
          `https://api.openf1.org/v1/session_result?session_key=${session.session_key}`,
          { cache: "no-store" }
        );

        if (!resultRes.ok) continue;

        const data = await resultRes.json();
        if (!Array.isArray(data) || data.length === 0) continue;

        results = data
          .filter((item): item is OpenF1Result => Number.isFinite(item?.position))
          .sort((a, b) => a.position - b.position);

        const driverRes = await fetch(
          `https://api.openf1.org/v1/drivers?session_key=${session.session_key}`,
          { cache: "no-store" }
        );

        const driverData = driverRes.ok ? await driverRes.json() : [];
        drivers = Array.isArray(driverData) ? driverData : [];

        sessionTitle = `${session.country_name ?? session.location ?? "Latest"} • Practice 1`;
        break;
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error("Practice 1 error:", error);
  }

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
        {results.length === 0 ? (
          <p>Practice 1 데이터 없음</p>
        ) : (
          <div>
            {results.map((result) => {
              const driver = drivers.find(
                (item) => item.driver_number === result.driver_number
              );

              return (
                <div
                  key={result.driver_number}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 56px 1fr",
                    gap: "10px",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid #2b347a",
                  }}
                >
                  <strong>
                    P{result.position}
                  </strong>

                  <strong>
                    #{result.driver_number}
                  </strong>

                  <div>
                    <div>
                      {driver?.full_name ??
                        `Driver #${result.driver_number}`}
                    </div>

                    <div
                      style={{
                        color: "#a9adff",
                        fontSize: "14px",
                        marginTop: "3px",
                      }}
                    >
                      {driver?.team_name ?? "Unknown Team"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
