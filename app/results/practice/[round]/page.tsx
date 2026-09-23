import BottomNav from "../../../components/BottomNav";
import ResultsTabs from "../../ResultsTabs";

type Session = {
  session_key: number;
  session_name: string;
  date_start: string;
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

export default async function PracticePage() {
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
  {
    cache: "no-store",
  }
);
    const sessions: Session[] =
      await sessionRes.json();

    console.log("sessions", sessions);

    const fp1Sessions = sessions
      .filter(
        (s) =>
          s.session_name ===
          "Practice 1"
      )
      .sort(
        (a, b) =>
          new Date(
            b.date_start
          ).getTime() -
          new Date(
            a.date_start
          ).getTime()
      );

    console.log(
      "fp1Sessions",
      fp1Sessions
    );

    const latestSession =
      fp1Sessions[0];

    if (latestSession) {
      raceName =
        latestSession.session_name;

      const [resultsRes, driversRes] =
        await Promise.all([
          fetch(
            `https://api.openf1.org/v1/session_result?session_key=${latestSession.session_key}`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            `https://api.openf1.org/v1/drivers?session_key=${latestSession.session_key}`,
            {
              cache: "no-store",
            }
          ),
        ]);

      const results: SessionResult[] =
        await resultsRes.json();

      const drivers: Driver[] =
        await driversRes.json();

      mergedResults = results.map(
        (result) => {
          const driver =
            drivers.find(
              (d) =>
                d.driver_number ===
                result.driver_number
            );

          return {
            position: result.position,
            driver_number:
              result.driver_number,
            full_name:
              driver?.full_name ??
              "Unknown Driver",
            team_name:
              driver?.team_name ??
              "Unknown Team",
          };
        }
      );
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
          <p>데이터 없음</p>
        ) : (
          mergedResults.map(
            (driver) => (
              <div
                key={
                  driver.driver_number
                }
                style={{
                  padding: "12px 0",
                  borderBottom:
                    "1px solid #2b347a",
                }}
              >
                <strong>
                  P{driver.position}
                </strong>

                <div>
                  #{driver.driver_number}{" "}
                  {driver.full_name}
                </div>

                <div
                  style={{
                    color: "#a9adff",
                  }}
                >
                  {driver.team_name}
                </div>
              </div>
            )
          )
        )}
      </div>

      <BottomNav />
    </main>
  );
}
