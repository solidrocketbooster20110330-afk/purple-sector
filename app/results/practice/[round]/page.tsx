import BottomNav from "../../../components/BottomNav";

type DriverResult = {
  driver_number: number;
  full_name: string;
  team_name: string;
  position: number;
};

export default async function PracticePage({
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

  let results: DriverResult[] = [];

  try {
    const sessionRes = await fetch(
      "https://api.openf1.org/v1/sessions?session_name=Practice 1&year=2026"
    );

    const sessions = await sessionRes.json();

    if (sessions.length > 0) {
      const sessionKey =
        sessions[sessions.length - 1].session_key;

      const resultRes = await fetch(
        `https://api.openf1.org/v1/session_result?session_key=${sessionKey}`
      );

      results = await resultRes.json();
    }
  } catch {
    results = [];
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
      <h1>🛠 Practice Results</h1>

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
        {results.length === 0 ? (
          <p>FP1 데이터 없음</p>
        ) : (
          results.map((driver) => (
            <div
              key={driver.driver_number}
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
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
