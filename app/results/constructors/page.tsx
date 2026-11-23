import Link from "next/link";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: { name: string };
};

async function getConstructors(): Promise<ConstructorStanding[]> {
  try {
    const res = await fetch(
      "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
      { next: { revalidate: 900 }, headers: { Accept: "application/json" } }
    );
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("application/json")) {
      console.error("Constructor standings unavailable:", res.status);
      return [];
    }
    const data = await res.json();
    return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  } catch (error) {
    console.error("Constructor standings error:", error);
    return [];
  }
}

export default async function ConstructorsPage() {
  const constructors = await getConstructors();

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)", color: "white", padding: "24px", paddingBottom: "100px", fontFamily: "Arial" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Link href="/results" style={{ color: "white" }}>Race</Link>
        <Link href="/results/drivers" style={{ color: "white" }}>Drivers</Link>
        <Link href="/results/constructors" style={{ color: "white" }}>Constructors</Link>
      </div>
      <h1>🏆 Constructor Championship</h1>
      {constructors.map((team) => (
        <div key={team.Constructor?.name ?? team.position} style={{ background: "#131942", padding: "15px", marginTop: "10px", borderRadius: "12px" }}>
          {team.position}. {team.Constructor?.name ?? "Unknown team"} — {team.points} pts
        </div>
      ))}
      {constructors.length === 0 && <p style={{ color: "#bdb6ff" }}>컨스트럭터 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
    </main>
  );
}
