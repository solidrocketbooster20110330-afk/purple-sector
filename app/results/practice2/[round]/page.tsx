import BottomNav from "../../../components/BottomNav";
import ResultsTabs from "../../ResultsTabs";

type OpenF1Session = {
  session_key: number;
  session_name: string;
  date_start: string;
  country_name?: string;
  location?: string;
  is_cancelled?: boolean;
};

type Result = {
  position: number;
  driver_number: number;
  duration?: number;
  gap_to_leader?: number;
  number_of_laps?: number;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
};

type Driver = {
  driver_number: number;
  full_name: string;
  team_name: string;
};

type Row = Result & {
  full_name: string;
  team_name: string;
};

const SESSION_NAME = "Practice 2";

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

const headers = ["POS", "NO", "DRIVER", "TEAM", "TIME", "GAP", "LAPS"];

function formatTime(duration?: number) {
  if (!Number.isFinite(duration)) return "-";
  const ms = Math.round((duration as number) * 1000);
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes > 0 ? `${minutes}:` : ""}${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function formatGap(gap?: number) {
  if (!Number.isFinite(gap) || gap === 0) return "LEADER";
  return `+${(gap as number).toFixed(3)}s`;
}

async function readJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) return null;

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getPractice() {
  const sessionsResponse = await fetch("https://api.openf1.org/v1/sessions", {
    cache: "no-store",
  });

  if (!sessionsResponse.ok) {
    throw new Error("OpenF1 sessions request failed");
  }

  const sessions = (await readJson<OpenF1Session[]>(sessionsResponse)) ?? [];

  const candidates = sessions
    .filter((session) => {
      const start = new Date(session.date_start).getTime();

      return (
        session.session_name === SESSION_NAME &&
        Number.isFinite(start) &&
        start <= Date.now() &&
        !session.is_cancelled
      );
    })
    .sort(
      (a, b) =>
        new Date(b.date_start).getTime() -
        new Date(a.date_start).getTime()
    );

  for (const session of candidates.slice(0, 5)) {
    try {
      const resultResponse = await fetch(
        `https://api.openf1.org/v1/session_result?session_key=${session.session_key}`,
        { cache: "no-store" }
      );

      const resultData = await readJson<Result[]>(resultResponse);
      if (!Array.isArray(resultData)) continue;

      const results = resultData
        .filter(
          (result) =>
            Number.isFinite(result.position) &&
            Number.isFinite(result.driver_number)
        )
        .sort((a, b) => a.position - b.position);

      if (results.length === 0) continue;

      const driverResponse = await fetch(
        `https://api.openf1.org/v1/drivers?session_key=${session.session_key}`,
        { cache: "no-store" }
      );
      const drivers = (await readJson<Driver[]>(driverResponse)) ?? [];

      const rows: Row[] = results.map((result) => {
        const driver = drivers.find(
          (item) => item.driver_number === result.driver_number
        );

        return {
          ...result,
          full_name: driver?.full_name ?? `Driver #${result.driver_number}`,
          team_name: driver?.team_name ?? "Unknown Team",
        };
      });

      return {
        session,
        rows,
      };
    } catch {
      continue;
    }
  }

  return { session: null, rows: [] as Row[] };
}

function statusText(row: Row) {
  if (row.dsq) return "DSQ";
  if (row.dns) return "DNS";
  if (row.dnf) return "DNF";
  return formatTime(row.duration);
}

export default async function PracticePage() {
  let data: Awaited<ReturnType<typeof getPractice>> = {
    session: null,
    rows: [],
  };

  try {
    data = await getPractice();
  } catch (error) {
    console.error(`${SESSION_NAME} page error:`, error);
  }

  const { session, rows } = data;

  return (
    <main style={pageStyle}>
      <h1>🛠 {SESSION_NAME} Results</h1>
      <p style={{ color: "#a9adff", marginBottom: "20px" }}>
        {session
          ? `${session.country_name ?? session.location ?? "Latest"} • ${SESSION_NAME}`
          : `Latest ${SESSION_NAME}`}
      </p>

      <ResultsTabs />

      <div style={cardStyle}>
        {rows.length === 0 ? (
          <p>{SESSION_NAME} 데이터 없음</p>
        ) : (
          <table
            style={{
              width: "100%",
              minWidth: "720px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign:
                        header === "DRIVER" || header === "TEAM"
                          ? "left"
                          : "center",
                      padding: "12px 10px",
                      color: "#a9adff",
                      fontSize: "12px",
                      borderBottom: "1px solid #2b347a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.driver_number}>
                  <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>
                    P{row.position}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>
                    #{row.driver_number}
                  </td>
                  <td style={cellStyle}>{row.full_name}</td>
                  <td style={{ ...cellStyle, color: "#a9adff" }}>
                    {row.team_name}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {statusText(row)}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {row.dnf || row.dns || row.dsq
                      ? "-"
                      : formatGap(row.gap_to_leader)}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {row.number_of_laps ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

const cellStyle = {
  padding: "14px 10px",
  borderBottom: "1px solid #222a66",
  whiteSpace: "nowrap" as const,
};
