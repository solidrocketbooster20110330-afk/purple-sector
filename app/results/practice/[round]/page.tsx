import BottomNav from "../../../components/BottomNav";

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

  let debugData: unknown = null;

  try {
    const sessionRes = await fetch(
      "https://api.openf1.org/v1/sessions?year=2026",
      {
        next: { revalidate: 3600 },
      }
    );

    const sessions = await sessionRes.json();

    const sessionKey =
      sessions?.[0]?.session_key;

    const resultRes = await fetch(
      `https://api.openf1.org/v1/session_result?session_key=${sessionKey}`,
      {
        next: { revalidate: 3600 },
      }
    );

    debugData =
      await resultRes.json();
  } catch (error) {
    debugData = {
      error: String(error),
    };
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
      <h1>🛠 Practice Debug</h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "20px",
        }}
      >
        {raceName}
      </p>

      <pre
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          fontSize: "12px",
        }}
      >
        {JSON.stringify(
          debugData,
          null,
          2
        )}
      </pre>

      <BottomNav />
    </main>
  );
}
