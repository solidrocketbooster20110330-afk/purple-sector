type RaceResult = {
  position: string;
  grid: string;
  points: string;
  status: string;

  Time?: {
    time: string;
  };

  Driver: {
    givenName: string;
    familyName: string;
  };

  Constructor: {
    name: string;
  };
};

export default async function ResultsPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/last/results.json",
    {
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();

  const race = data.MRData.RaceTable.Races[0];
  const results: RaceResult[] = race.Results;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <a
        href="/"
        style={{
          display: "inline-block",
          color: "white",
          textDecoration: "none",
          background: "#1a2157",
          padding: "10px 18px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        ← Home
      </a>

      <h1>🏁 Last Race Results</h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "20px",
        }}
      >
        {race.raceName}
      </p>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 80px 140px 80px",
            gap: "10px",
            paddingBottom: "12px",
            borderBottom: "2px solid #2b347a",
            color: "#a9adff",
            fontWeight: "bold",
          }}
        >
          <div>POS</div>
          <div>DRIVER</div>
          <div>GRID</div>
          <div>STATUS</div>
          <div>PTS</div>
        </div>

        {results.map((driver) => (
          <div
            key={driver.position}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 80px 140px 80px",
              gap: "10px",
              padding: "14px 0",
              borderBottom: "1px solid #2b347a",
              alignItems: "center",
            }}
          >
            <strong>P{driver.position}</strong>

            <div>
              <div>
                {driver.Driver.givenName}{" "}
                {driver.Driver.familyName}
              </div>

              <div
                style={{
                  color: "#a9adff",
                  fontSize: "13px",
                }}
              >
                {driver.Constructor.name}
              </div>
            </div>

            <div>P{driver.grid}</div>

            <div>
              {driver.status === "Finished"
                ? driver.position === "1"
                  ? "🏆 Winner"
                  : driver.Time?.time ?? "Finished"
                : `⚠️ ${driver.status}`}
            </div>

            <strong>{driver.points}</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
