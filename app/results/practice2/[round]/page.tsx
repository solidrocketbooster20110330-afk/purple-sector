import BottomNav from "../../../components/BottomNav";
import ResultsTabs from "../../ResultsTabs";

type Session = {
  session_key: number;
  session_name: string;
  session_type?: string;
  date_start: string;
  date_end?: string;
  country_name?: string;
  location?: string;
  year?: number;
  is_cancelled?: boolean;
};

type SessionResult = {
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

function formatTime(duration?: number) {
  if (!Number.isFinite(duration)) return "-";

  const totalMs = Math.round((duration as number) * 1000);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;

  return `${minutes > 0 ? minutes + ":" : ""}${String(seconds).padStart(2, "0")}.${String(
    milliseconds
  ).padStart(3, "0")}`;
}

function formatGap(gap?: number) {
  if (!Number.isFinite(gap) || gap === 0) return "LEADER";
  return `+${(gap as number).toFixed(3)}s`;
}

export default async function Practice2Page() {
  let results: Array<{
    position: number;
    driver_number: number;
    full_name: string;
    team_name: string;
    duration?: number;
    gap_to_leader?: number;
    number_of_laps?: number;
    dnf?: boolean;
    dns?: boolean;
    dsq?: boolean;
  }> = [];

  let sessionTitle = "Latest Practice 2";

  try {
    const sessionRes = await fetch(
      "https://api.openf1.org/v1/sessions",
      { cache: "no-store" }
    );

    if (!sessionRes.ok) {
      throw new Error("Failed to load OpenF1 sessions");
    }

    const sessionsData = await sessionRes.json();
    const sessions: Session[] = Array.isArray(sessionsData)
      ? sessionsData
      : [];

    const candidates = sessions
      .filter(
        (session) =>
          session.session_name === "Practice 2" &&
          (session.year ?? 0) >= 2025 &&
          !session.is_cancelled
      )
      .sort(
        (a, b) =>
          new Date(b.date_start).getTime() -
          new Date(a.date_start).getTime()
      );

    for (const session of candidates) {
      const resultsRes = await fetch(
        `https://api.openf1.org/v1/session_result?session_key=${session.session_key}`,
        { cache: "no-store" }
      );

      if (!resultsRes.ok) continue;

      const resultsData = await resultsRes.json();
      if (!Array.isArray(resultsData) || resultsData.length === 0) continue;

      const driversRes = await fetch(
        `https://api.openf1.org/v1/drivers?session_key=${session.session_key}`,
        { cache: "no-store" }
      );

      const driversData = driversRes.ok ? await driversRes.json() : [];
      const drivers: Driver[] = Array.isArray(driversData)
        ? driversData
        : [];

      results = (resultsData as SessionResult[])
        .filter((item) => Number.isFinite(item.position))
        .sort((a, b) => a.position - b.position)
        .map((item) => {
          const driver = drivers.find(
            (d) => d.driver_number === item.driver_number
          );

          return {
            position: item.position,
            driver_number: item.driver_number,
            full_name:
              driver?.full_name ?? `Driver #${item.driver_number}`,
            team_name: driver?.team_name ?? "Unknown Team",
            duration: item.duration,
            gap_to_leader: item.gap_to_leader,
            number_of_laps: item.number_of_laps,
            dnf: item.dnf,
            dns: item.dns,
            dsq: item.dsq,
          };
        });

      sessionTitle = session.country_name
        ? `${session.country_name} • Practice 2`
        : `${session.location ?? "Latest"} • Practice 2`;

      break;
    }
  } catch (error) {
    console.error("Practice 2 error:", error);
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
      <h1>🛠 Practice 2 Results</h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "20px",
        }}
      >
        {sessionTitle}
      </p>

      <ResultsTabs />

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "12px 18px",
          overflowX: "auto",
        }}
      >
        {results.length === 0 ? (
          <p>Practice 2 데이터 없음</p>
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
                {["POS", "NO", "DRIVER", "TEAM", "TIME", "GAP", "LAPS"].map(
                  (header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: header === "DRIVER" || header === "TEAM" ? "left" : "center",
                        padding: "12px 10px",
                        color: "#a9adff",
                        fontSize: "12px",
                        borderBottom: "1px solid #2b347a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {results.map((driver) => (
                <tr key={driver.driver_number}>
                  <td
                    style={{
                      padding: "14px 10px",
                      textAlign: "center",
                      fontWeight: "bold",
                      borderBottom: "1px solid #222a66",
                    }}
                  >
                    P{driver.position}
                  </td>

                  <td
                    style={{
                      padding: "14px 10px",
                      textAlign: "center",
                      fontWeight: "bold",
                      borderBottom: "1px solid #222a66",
                    }}
                  >
                    #{driver.driver_number}
                  </td>

                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #222a66",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {driver.full_name}
                  </td>

                  <td
                    style={{
                      padding: "14px 10px",
                      color: "#a9adff",
                      borderBottom: "1px solid #222a66",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {driver.team_name}
                  </td>

                  <td
                    style={{
                      padding: "14px 10px",
                      textAlign: "center",
                      borderBottom: "1px solid #222a66",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {driver.dsq
                      ? "DSQ"
                      : driver.dns
                      ? "DNS"
                      : driver.dnf
                      ? "DNF"
                      : formatTime(driver.duration)}
                  </td>

                  <td
                    style={{
                      padding: "14px 10px",
                      textAlign: "center",
                      borderBottom: "1px solid #222a66",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {driver.dsq || driver.dns || driver.dnf
                      ? "-"
                      : formatGap(driver.gap_to_leader)}
                  </td>

                  <td
                    style={{
                      padding: "14px 10px",
                      textAlign: "center",
                      borderBottom: "1px solid #222a66",
                    }}
                  >
                    {driver.number_of_laps ?? "-"}
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
