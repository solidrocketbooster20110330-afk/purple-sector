import Link from "next/link";
import BottomNav from "../components/BottomNav";

type Session = { date?: string; time?: string };
type Race = {
  round: string; raceName: string; date: string; time?: string;
  FirstPractice?: Session; SecondPractice?: Session; ThirdPractice?: Session;
  SprintQualifying?: Session; Sprint?: Session; Qualifying?: Session;
  Circuit?: { circuitName?: string };
};

const KST_TIME_ZONE = "Asia/Seoul";
const pageStyle = { minHeight:"100vh", background:"linear-gradient(180deg,#05071f 0%,#0c1037 100%)", color:"white", padding:"24px", paddingBottom:"100px", fontFamily:"Arial, sans-serif" };
const cardStyle = { background:"#131942", border:"1px solid #2b347a", borderRadius:"18px" };

function formatKstSession(date?: string, time?: string) {
  if (!date) return "TBA";
  const parsed = new Date(`${date}T${time ?? "00:00:00Z"}`);
  if (Number.isNaN(parsed.getTime())) return "TBA";
  return parsed.toLocaleString("ko-KR", { timeZone: KST_TIME_ZONE, month:"short", day:"numeric", hour:"2-digit", minute:"2-digit", hour12:false }) + " KST";
}

export default async function SchedulePage() {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/current.json", { next:{ revalidate:900 } });
  const data = res.ok ? await res.json() : null;
  const races: Race[] = data?.MRData?.RaceTable?.Races ?? [];
  const now = Date.now();
  const nextRace = races.find((race) => {
    const time = new Date(`${race.date}T${race.time ?? "00:00:00Z"}`).getTime();
    return Number.isFinite(time) && time >= now;
  }) ?? races[races.length - 1];

  return (
    <main style={pageStyle}>
      <h1 style={{fontSize:"36px",margin:"0 0 20px"}}>📅 Schedule</h1>
      {nextRace && (
        <Link href={`/schedule/${nextRace.round}`} style={{...cardStyle,display:"block",padding:"22px",marginBottom:"24px",textDecoration:"none",color:"white"}}>
          <div style={{color:"#a9adff",marginBottom:"8px",fontSize:"13px"}}>NEXT RACE</div>
          <div style={{fontSize:"28px",fontWeight:"bold"}}>{nextRace.raceName}</div>
          <div style={{marginTop:"10px",color:"#c7cbff"}}>{formatKstSession(nextRace.date,nextRace.time)} →</div>
        </Link>
      )}
      <h2 style={{marginBottom:"15px",color:"#a9adff"}}>2026 SEASON</h2>
      {races.map((race) => (
        <Link key={race.round} href={`/schedule/${race.round}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",marginBottom:"10px",...cardStyle,borderRadius:"14px",textDecoration:"none",color:"white"}}>
          <div><div style={{fontWeight:"bold"}}>{race.raceName}</div><div style={{color:"#a9adff",fontSize:"13px"}}>Round {race.round}</div></div>
          <div style={{textAlign:"right",color:"#c7cbff",fontSize:"13px"}}>{formatKstSession(race.date,race.time)}</div>
        </Link>
      ))}
      <BottomNav />
    </main>
  );
}
