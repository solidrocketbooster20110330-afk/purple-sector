import Link from "next/link";
import BottomNav from "../../components/BottomNav";

type Session = { date?: string; time?: string };
const KST_TIME_ZONE = "Asia/Seoul";

function formatKstSession(session?: Session) {
  if (!session?.date) return "TBA";
  const date = new Date(`${session.date}T${session.time ?? "00:00:00Z"}`);
  if (Number.isNaN(date.getTime())) return "TBA";
  return date.toLocaleString("ko-KR", { timeZone: KST_TIME_ZONE, month:"short", day:"numeric", hour:"2-digit", minute:"2-digit", hour12:false }) + " KST";
}

export default async function RoundPage({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/current/${round}.json`, { next:{revalidate:900} });
  const data = res.ok ? await res.json() : null;
  const race = data?.MRData?.RaceTable?.Races?.[0];

  if (!race) {
    return <main style={{minHeight:"100vh",background:"#05071f",color:"white",padding:"24px"}}><Link href="/schedule" style={{color:"#a9adff"}}>← Schedule</Link><h1>Schedule unavailable</h1><BottomNav /></main>;
  }

  const sessions = [
    race.FirstPractice && { title:"FP1", time:formatKstSession(race.FirstPractice), result:`/results/practice/${round}` },
    race.SecondPractice && { title:"FP2", time:formatKstSession(race.SecondPractice), result:`/results/practice2/${round}` },
    race.ThirdPractice && { title:"FP3", time:formatKstSession(race.ThirdPractice), result:`/results/practice3/${round}` },
    race.SprintQualifying && { title:"Sprint Qualifying", time:formatKstSession(race.SprintQualifying), result:null },
    race.Sprint && { title:"Sprint", time:formatKstSession(race.Sprint), result:null },
    race.Qualifying && { title:"Qualifying", time:formatKstSession(race.Qualifying), result:`/results/qualifying?round=${round}` },
    { title:"Race", time:formatKstSession({date:race.date,time:race.time}), result:`/results?round=${round}` },
  ].filter(Boolean) as Array<{title:string;time:string;result:string|null}>;

  const cardStyle={background:"#131942",border:"1px solid #2b347a",borderRadius:"16px",padding:"16px",marginBottom:"12px"};
  const buttonStyle={display:"inline-block",marginTop:"10px",padding:"9px 13px",background:"#1f2a6b",borderRadius:"10px",textDecoration:"none",color:"white",fontWeight:"bold",fontSize:"14px"};

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(180deg,#05071f 0%,#0c1037 100%)",color:"white",padding:"24px",paddingBottom:"100px",fontFamily:"Arial,sans-serif"}}>
      <Link href="/schedule" style={{color:"#a9adff",textDecoration:"none"}}>← Schedule</Link>
      <div style={{marginTop:"20px",marginBottom:"26px"}}>
        <div style={{color:"#a9adff",fontSize:"14px"}}>ROUND {round}</div>
        <h1 style={{margin:"8px 0"}}>{race.raceName}</h1>
        <div style={{color:"#c7cbff"}}>📍 {race.Circuit?.circuitName ?? "Circuit TBA"}</div>
      </div>
      {sessions.map((session)=>(
        <div key={session.title} style={cardStyle}>
          <h2 style={{margin:"0 0 6px"}}>{session.title}</h2>
          <div style={{color:"#a9adff"}}>{session.time}</div>
          {session.result && <Link href={session.result} style={buttonStyle}>View Results →</Link>}
        </div>
      ))}
      <BottomNav />
    </main>
  );
}
