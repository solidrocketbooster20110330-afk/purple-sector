import BottomNav from "../../../components/BottomNav";

type SessionResult = {
  position: number;
  driver_number: number;
  meeting_key: number;
};

type Driver = {
  driver_number: number;
  first_name: string;
  last_name: string;
  team_name: string;
};

export default async function Practice2Page({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round } = await params;

  // 임시 매핑
  const meetingKeys: Record<string, number> = {
    "1": 1304,
  };

  const meetingKey = meetingKeys[round];

  const [resultsRes, driversRes, raceRes] = await Promise.all([
    fetch(
      `https://api.openf1.org/v1/session_result?session_key=${meetingKey}`
    ),
    fetch(
      `https://api.openf1.org/v1/drivers?meeting_key=${meetingKey}`
    ),
    fetch(
      `https://api.jolpi.ca/ergast/f1/2026/${round}.json`
    ),
  ]);

  const results: SessionResult[] =
    await resultsRes.json();

  const drivers: Driver[] =
    await driversRes.json();

  const raceData = await raceRes.json();

  const raceName =
    raceData?.MRData?.RaceTable?.Races?.[0]
      ?.raceName ?? `Round ${round}`;

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
      <h1>🛠 Practice 2 Results</h1>

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
        {results
          .sort((a, b) => a.position - b.position)
          .map((result) => {
            const driver = drivers.find(
              (d) =>
                d.driver_number ===
                result.driver_number
            );

            return (
              <div
                key={result.driver_number}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    "1px solid #2b347a",
                }}
              >
                <strong>
                  P{result.position}
                </strong>

                <div>
                  #{result.driver_number}{" "}
                  {driver?.first_name}{" "}
                  {driver?.last_name}
                </div>

                <div
                  style={{
                    color: "#a9adff",
                  }}
                >
                  {driver?.team_name}
                </div>
              </div>
            );
          })}
      </div>

      <BottomNav />
    </main>
  );
}
