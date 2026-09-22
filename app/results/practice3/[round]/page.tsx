import BottomNav from "../../../components/BottomNav";

type SessionResult = {
  position: number;
  driver_number: number;
};

type Driver = {
  driver_number: number;
  full_name: string;
  team_name: string;
};

export default async function Practice3Page({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round } = await params;

  const raceRes = await fetch(
    `https://api.jolpi.ca/ergast/f1/current/${round}.json`,
    {
      next: { revalidate: 3600 },
    }
  );

  const raceData = await raceRes.json();

  const race =
    raceData?.MRData?.RaceTable?.Races?.[0];

  const raceName =
    race?.raceName ?? `Round ${round}`;

  let mergedResults: Array<{
    position: number;
    driver_number: number;
    full_name: string;
    team_name: string;
  }> = [];

  try {
    const sessionRes = await fetch(
      "https://api.openf1.org/v1/sessions?year=2026",
      {
        next: { revalidate: 3600 },
      }
    );

    const sessions = await sessionRes.json();

    const sessionKey =
      sessions?.[2]?.session_key ??
      sessions?.[0]?.session_key;

    const [resultsRes, driversRes] =
      await Promise.all([
        fetch(
          `https://api.openf1.org/v1/session_result?session_key=${sessionKey}`
        ),
        fetch(
          `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`
        ),
      ]);

    const resultsData =
      await resultsRes.json();

    const driversData =
      await driversRes.json();

    const results: SessionResult[] =
      Array.isArray(resultsData)
        ? resultsData
        : [];

    const drivers: Driver[] =
      Array.isArray(driversData)
        ? driversData
        : [];

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
      <h1>🛠 Practice 3 Results</h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "20px",
        }}
      >
        {raceName}
      </p>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        {mergedResults.length === 0 ? (
          <p>FP3 데이터 없음</p>
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
                  #
                  {
                    driver.driver_number
                  }{" "}
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
