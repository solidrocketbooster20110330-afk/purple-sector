import BottomNav from "../../components/BottomNav";
import ResultsTabs from "../ResultsTabs";

type QualifyingResult = {
  position: string;
  Driver: { givenName: string; familyName: string };
  Constructor: { name: string };
  Q1?: string;
  Q2?: string;
  Q3?: string;
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

const headers = ["POS", "NO", "DRIVER", "TEAM", "Q1", "Q2", "Q3"];

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

export default async function QualifyingPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/last/qualifying.json",
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();

  const race = data?.MRData?.RaceTable?.Races?.[0];
  const results: QualifyingResult[] = race?.QualifyingResults ?? [];

  return (
    <main style={pageStyle}>
      <h1 style={{ marginBottom: "6px" }}>⚡ Qualifying Results</h1>
      <p style={{ color: "#a9adff", marginBottom: "20px" }}>
        {race?.raceName ?? "Latest Grand Prix"}
      </p>

      <ResultsTabs />

      <div style={cardStyle}>
        {results.length === 0 ? (
          <p>Qualifying 데이터 없음</p>
        ) : (
          <table
            style={{
              width: "100%",
              minWidth: "680px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      color: "#a9adff",
                      borderBottom: "2px solid #2b347a",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      padding: "12px 10px",
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
                const cell = {
                  padding: "14px 10px",
                  borderBottom: "1px solid #222a66",
                  whiteSpace: "nowrap" as const,
                };

                return (
                  <tr key={driver.position}>
                    <td style={{ ...cell, textAlign: "center", fontWeight: "bold" }}>
                      {positionLabel(driver.position)}
                    </td>
                    <td style={{ ...cell, textAlign: "center", fontWeight: "bold" }}>
                      -
                    </td>
                    <td style={cell}>
                      {driver.Driver.givenName} {driver.Driver.familyName}
                    </td>
                    <td style={{ ...cell, color: "#a9adff" }}>
                      {driver.Constructor.name}
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>{driver.Q1 ?? "-"}</td>
                    <td style={{ ...cell, textAlign: "center" }}>{driver.Q2 ?? "-"}</td>
                    <td style={{ ...cell, textAlign: "center" }}>{driver.Q3 ?? "-"}</td>
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
