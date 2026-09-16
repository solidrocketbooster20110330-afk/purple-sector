import BottomNav from "../../components/BottomNav";
import ResultsTabs from "../ResultsTabs";

type QualifyingResult = {
  position: string;

  Driver: {
    givenName: string;
    familyName: string;
  };

  Constructor: {
    name: string;
  };

  Q1?: string;
  Q2?: string;
  Q3?: string;
};

export default async function QualifyingPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/last/qualifying.json",
    {
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();

  const race =
    data.MRData.RaceTable.Races[0];

  const results: QualifyingResult[] =
    race.QualifyingResults;

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
      <h1>⚡ Qualifying</h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "20px",
        }}
      >
        {race.raceName}
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
        {results.map((driver) => (
          <div
            key={driver.position}
            style={{
              padding: "14px 0",
              borderBottom:
                "1px solid #2b347a",
            }}
          >
            <strong>
              P{driver.position}
            </strong>

            <div
              style={{
                marginTop: "4px",
              }}
            >
              {driver.Driver.givenName}{" "}
              {driver.Driver.familyName}
            </div>

            <div
              style={{
                color: "#a9adff",
                marginBottom: "8px",
              }}
            >
              {driver.Constructor.name}
            </div>

            <div>Q1: {driver.Q1 ?? "-"}</div>
            <div>Q2: {driver.Q2 ?? "-"}</div>
            <div>Q3: {driver.Q3 ?? "-"}</div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
        }
