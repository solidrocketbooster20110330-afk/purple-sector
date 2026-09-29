import BottomNav from "../../../components/BottomNav";
import ResultsTabs from "../../ResultsTabs";

type Row = {
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
};

function formatTime(duration?: number) {
  if (!Number.isFinite(duration)) return "-";
  const ms = Math.round((duration as number) * 1000);
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes > 0 ? minutes + ":" : ""}${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function formatGap(gap?: number) {
  if (!Number.isFinite(gap) || gap === 0) return "LEADER";
  return `+${(gap as number).toFixed(3)}s`;
}

async function getPractice() {
  const sessionsResponse = await fetch(
    "https://api.openf1.org/v1/sessions",
    { cache: "no-store" }
  );

  if (!sessionsResponse.ok) {
    throw new Error("OpenF1 sessions request failed");
  }

  const sessionsData = await sessionsResponse.json();
  const sessions = Array.isArray(sessionsData) ? sessionsData : [];

  const candidates = sessions
    .filter((session: any) => {
      const start = new Date(session.date_start).getTime();

      return (
        session.session_name === "Practice 2" &&
        Number.isFinite(start) &&
        start <= Date.now() &&
        !session.is_cancelled
      );
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.date_start).getTime() -
        new Date(a.date_start).getTime()
    );

  for (const session of candidates.slice(0, 5)) {
    try {
      const resultResponse = await fetch(
        `https://api.openf1.org/v1/session_result?session_key=${session.session_key}`,
        { cache: "no-store" }
      );

      if (!resultResponse.ok) continue;

      const resultData = await resultResponse.json();
      if (!Array.isArray(resultData) || resultData.length === 0) continue;

      const results = resultData
        .filter(
          (result: any) =>
            Number.isFinite(result?.position) &&
            Number.isFinite(result?.driver_number)
        )
        .sort((a: any, b: any) => a.position - b.position);

      if (results.length === 0) continue;

      const driverResponse = await fetch(
        `https://api.openf1.org/v1/drivers?session_key=${session.session_key}`,
        { cache: "no-store" }
      );

      const driverData = driverResponse.ok
        ? await driverResponse.json()
        : [];

      const drivers = Array.isArray(driverData) ? driverData : [];

      return {
        session: {
          country_name: session.country_name,
          location: session.location,
          session_name: session.session_name,
        },
        results: results.map((result: any) => {
          const driver = drivers.find(
            (item: any) => item.driver_number === result.driver_number
          );

          return {
            position: result.position,
            driver_number: result.driver_number,
            full_name:
              driver?.full_name ?? `Driver #${result.driver_number}`,
            team_name: driver?.team_name ?? "Unknown Team",
            duration: result.duration,
            gap_to_leader: result.gap_to_leader,
            number_of_laps: result.number_of_laps,
            dnf: result.dnf,
            dns: result.dns,
            dsq: result.dsq,
          };
        }),
      };
    } catch {
      continue;
    }
  }

  return {
    session: null,
    results: [],
  };
}

export default async function Practice2Page() {
  let data: { session?: any; results?: Row[] } | null = null;

  try {
    data = await getPractice();
  } catch (error) {
    console.error("Practice 2 page error:", error);
  }

  const rows = Array.isArray(data?.results) ? data.results : [];
  const session = data?.session;

  return (
    <main style={{ minHeight:"100vh", background:"linear-gradient(180deg,#05071f 0%,#0c1037 100%)", color:"white", padding:"24px", paddingBottom:"100px", fontFamily:"Arial" }}>
      <h1>🛠 Practice 2 Results</h1>
      <p style={{ color:"#a9adff", marginBottom:"20px" }}>
        {session ? `${session.country_name ?? session.location ?? "Latest"} • Practice 2` : "Latest Practice 2"}
      </p>

      <ResultsTabs />

      <div style={{ background:"#131942", border:"1px solid #2b347a", borderRadius:"20px", padding:"20px", overflowX:"auto" }}>
        {rows.length === 0 ? (
          <p>Practice 2 데이터 없음</p>
        ) : (
          <table style={{ width:"100%", minWidth:"720px", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["POS","NO","DRIVER","TEAM","TIME","GAP","LAPS"].map((h) => (
                  <th key={h} style={{ textAlign:h==="DRIVER"||h==="TEAM"?"left":"center", padding:"12px 10px", color:"#a9adff", fontSize:"12px", borderBottom:"1px solid #2b347a", whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.driver_number}>
                  <td style={{padding:"14px 10px",textAlign:"center",fontWeight:"bold",borderBottom:"1px solid #222a66"}}>P{row.position}</td>
                  <td style={{padding:"14px 10px",textAlign:"center",fontWeight:"bold",borderBottom:"1px solid #222a66"}}>#{row.driver_number}</td>
                  <td style={{padding:"14px 10px",borderBottom:"1px solid #222a66",whiteSpace:"nowrap"}}>{row.full_name}</td>
                  <td style={{padding:"14px 10px",color:"#a9adff",borderBottom:"1px solid #222a66",whiteSpace:"nowrap"}}>{row.team_name}</td>
                  <td style={{padding:"14px 10px",textAlign:"center",borderBottom:"1px solid #222a66",whiteSpace:"nowrap"}}>{row.dsq?"DSQ":row.dns?"DNS":row.dnf?"DNF":formatTime(row.duration)}</td>
                  <td style={{padding:"14px 10px",textAlign:"center",borderBottom:"1px solid #222a66",whiteSpace:"nowrap"}}>{row.dsq||row.dns||row.dnf?"-":formatGap(row.gap_to_leader)}</td>
                  <td style={{padding:"14px 10px",textAlign:"center",borderBottom:"1px solid #222a66"}}>{row.number_of_laps ?? "-"}</td>
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