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
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://purple-sector.vercel.app";

  const response = await fetch(
    `${base}/api/practice?type=3`,
    { cache: "no-store" }
  );

  if (!response.ok) return null;
  return response.json();
}

export default async function Practice3Page() {
  let data: { session?: any; results?: Row[] } | null = null;

  try {
    data = await getPractice();
  } catch (error) {
    console.error("Practice 3 page error:", error);
  }

  const rows = Array.isArray(data?.results) ? data.results : [];
  const session = data?.session;

  return (
    <main style={{ minHeight:"100vh", background:"linear-gradient(180deg,#05071f 0%,#0c1037 100%)", color:"white", padding:"24px", paddingBottom:"100px", fontFamily:"Arial" }}>
      <h1>🛠 Practice 3 Results</h1>
      <p style={{ color:"#a9adff", marginBottom:"20px" }}>
        {session ? `${session.country_name ?? session.location ?? "Latest"} • Practice 3` : "Latest Practice 3"}
      </p>

      <ResultsTabs />

      <div style={{ background:"#131942", border:"1px solid #2b347a", borderRadius:"20px", padding:"20px", overflowX:"auto" }}>
        {rows.length === 0 ? (
          <p>Practice 3 데이터 없음</p>
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