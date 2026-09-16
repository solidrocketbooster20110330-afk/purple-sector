type RaceResult = {
  number: string;
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
        background:
          "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "24px",
        paddingBottom: "100px",
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

      <h1
        style={{
          marginBottom: "6px",
        }}
      >
        🏁 Race Results
      </h1>

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
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "70px 60px 1.5fr 1fr 70px 140px 60px",
            gap: "10px",
            paddingBottom: "12px",
            borderBottom: "2px solid #2b347a",
            color: "#a9adff",
            fontWeight: "bold",
          }}
        >
          <div>POS</div>
          <div>NO</div>
          <div>DRIVER</div>
          <div>TEAM</div>
          <div>GRID</div>
          <div>STATUS</div>
          <div>PTS</div>
        </div>

        {results.map((driver) => {
          let statusText = "";

          if (driver.position === "1") {
            statusText = "🏆 Winner";
          } else if (
            driver.status.includes("Lap")
          ) {
            statusText = driver.status;
          } else if (
            driver.status === "Finished"
          ) {
            statusText =
              driver.Time?.time ??
              "Finished";
          } else {
            statusText = "DNF";
          }

          return (
            <div
              key={driver.position}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "70px 60px 1.5fr 1fr 70px 140px 60px",
                gap: "10px",
                padding: "14px 0",
                borderBottom:
                  "1px solid #2b347a",
                alignItems: "center",
              }}
            >
              <strong>
                {driver.position === "1"
                  ? "🥇"
                  : driver.position === "2"
                  ? "🥈"
                  : driver.position === "3"
                  ? "🥉"
                  : `P${driver.position}`}
              </strong>

              <div>
                #{driver.number}
              </div>

              <div>
                {
                  driver.Driver
                    .givenName
                }{" "}
                {
                  driver.Driver
                    .familyName
                }
              </div>

              <div
                style={{
                  color: "#a9adff",
                }}
              >
                {
                  driver.Constructor
                    .name
                }
              </div>

              <div>
                P{driver.grid}
              </div>

              <div
                style={{
                  color:
                    statusText ===
                    "DNF"
                      ? "#ff4d4d"
                      : "white",
                  fontWeight:
                    statusText ===
                    "DNF"
                      ? "bold"
                      : "normal",
                }}
              >
                {statusText}
              </div>

              <strong>
                {driver.points}
              </strong>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#131942",
          borderTop:
            "1px solid #2b347a",
          display: "flex",
          justifyContent:
            "space-around",
          padding: "16px 0",
          zIndex: 999,
        }}
      >
        <a
          href="/"
          style={{
            color: "white",
            textDecoration:
              "none",
            fontWeight: "bold",
          }}
        >
          🏠 Home
        </a>

        <a
          href="/results"
          style={{
            color: "#a855f7",
            textDecoration:
              "none",
            fontWeight: "bold",
          }}
        >
          🏁 Results
        </a>

        <a
          href="/schedule"
          style={{
            color: "white",
            textDecoration:
              "none",
            fontWeight: "bold",
          }}
        >
          📅 Schedule
        </a>
      </div>
    </main>
  );
}
