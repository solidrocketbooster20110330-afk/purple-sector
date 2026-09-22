import BottomNav from "../../../components/BottomNav";

type PracticeResult = {
  position: string;

  Driver: {
    permanentNumber?: string;
    givenName: string;
    familyName: string;
  };

  Constructor: {
    name: string;
  };

  Time?: {
    time: string;
  };
};

export default async function PracticePage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round } = await params;

  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/2025/${round}/results.json`,
    {
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();

  const race =
    data?.MRData?.RaceTable?.Races?.[0];

  const results: PracticeResult[] =
    race?.Results || [];

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
        {race?.raceName ?? `Round ${round}`}
      </p>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        {results.map((driver) => (
          <div
            key={driver.position}
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
              {driver.Driver
                .permanentNumber ?? "-"}{" "}
              {driver.Driver.givenName}{" "}
              {driver.Driver.familyName}
            </div>

            <div
              style={{
                color: "#a9adff",
              }}
            >
              {driver.Constructor.name}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
