import BottomNav from "../components/BottomNav";
import ResultsTabs from "./ResultsTabs";

type RaceResult = {
  number: string;
  position: string;
  grid: string;
  points: string;
  status: string;
  Time?: { time: string };
  Driver: { givenName: string; familyName: string };
  Constructor: { name: string };
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#131942",
  border: "1px solid #2b347a",
  borderRadius: "20px",
  padding: "20px",
  overflowX: "auto" as const,
};

const columns = "70px 60px 1.5fr 1fr 70px 140px 60px";

function getStatusText(result: RaceResult) {
  if (result.status.includes("Lap")) {
    const laps = result.status.match(/\d+/)?.[0] ?? "1";
    return `+${laps} Lap`;
  }

  if (result.status === "Finished") {
    return result.Time?.time ?? "Finished";
  }

  return "DNF";
}

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

export default async function ResultsPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/last/results.json",
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();

  const race = data?.MRData?.RaceTable?.Races?.[0];
  const results: RaceResult[] = race?.Results ?? [];

  return (
    <main style={pageStyle}>
      <h1 style={{ marginBottom: "6px" }}>🏁 Results</h1>
      <p style={{ color: "#a9adff", marginBottom: "20px" }}>
        {race?.raceName ?? "Latest Grand Prix"}
      </p>

      <ResultsTabs />

      <div style={cardStyle}>
        {results.length === 0 ? (
          <p>Race 데이터 없음</p>
        ) : (
          <div style={{ minWidth: "700px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: columns,
                gap: "10px",
                paddingBottom: "12px",
                borderBottom: "2px solid #2b347a",
                color: "#a9adff",
                fontWeight: "bold",
              }}
            >
              {["POS", "NO", "DRIVER", "TEAM", "GRID", "STATUS", "PTS"].map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>

            {results.map((driver) => {
              const statusText = getStatusText(driver);

              return (
                <div
                  key={driver.position}
                  style={{
                    display: "grid",
                    gridTemplateColumns: columns,
                    gap: "10px",
                    padding: "14px 0",
                    borderBottom: "1px solid #2b347a",
                    alignItems: "center",
                  }}
                >
                  <strong>{positionLabel(driver.position)}</strong>
                  <div>#{driver.number}</div>
                  <div>{driver.Driver.givenName} {driver.Driver.familyName}</div>
                  <div style={{ color: "#a9adff" }}>{driver.Constructor.name}</div>
                  <div>P{driver.grid}</div>
                  <div
                    style={{
                      color: statusText === "DNF" ? "#ff7a7a" : "white",
                      fontWeight: statusText === "DNF" ? "bold" : "normal",
                    }}
                  >
                    {statusText}
                  </div>
                  <strong>{driver.points}</strong>
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
