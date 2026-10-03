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

const columns = "60px 60px minmax(170px, 1.45fr) minmax(150px, 1.2fr) 70px 140px 60px";
const headers = ["POS", "NO", "DRIVER", "TEAM", "GRID", "STATUS", "PTS"];

function cellStyle(textAlign: "left" | "center" = "left") {
  return {
    padding: "14px 8px",
    borderBottom: "1px solid #2b347a",
    whiteSpace: "nowrap" as const,
    textAlign,
  };
}

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

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
          <table
            style={{
              width: "100%",
              minWidth: "820px",
              tableLayout: "fixed",
              borderCollapse: "collapse",
            }}
          >
            <colgroup>
              <col style={{ width: "60px" }} />
              <col style={{ width: "60px" }} />
              <col style={{ width: "190px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "70px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "60px" }} />
            </colgroup>

            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "12px 8px",
                      color: "#a9adff",
                      borderBottom: "2px solid #2b347a",
                      whiteSpace: "nowrap",
                      textAlign:
                        header === "DRIVER" || header === "TEAM"
                          ? "left"
                          : "center",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {results.map((driver) => {
                const statusText = getStatusText(driver);

                return (
                  <tr key={driver.position}>
                    <td style={{ ...cellStyle("center"), fontWeight: "bold" }}>
                      {positionLabel(driver.position)}
                    </td>
                    <td style={{ ...cellStyle("center"), fontWeight: "bold" }}>
                      #{driver.number}
                    </td>
                    <td style={cellStyle("left")}>
                      {driver.Driver.givenName} {driver.Driver.familyName}
                    </td>
                    <td
                      style={{
                        ...cellStyle("left"),
                        color: "#a9adff",
                        whiteSpace: "normal",
                      }}
                    >
                      {driver.Constructor.name}
                    </td>
                    <td style={cellStyle("center")}>P{driver.grid}</td>
                    <td
                      style={{
                        ...cellStyle("center"),
                        color: statusText === "DNF" ? "#ff7a7a" : "white",
                        fontWeight: statusText === "DNF" ? "bold" : "normal",
                      }}
                    >
                      {statusText}
                    </td>
                    <td style={{ ...cellStyle("center"), fontWeight: "bold" }}>
                      {driver.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
