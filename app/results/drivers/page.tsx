import Link from "next/link";

type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: { givenName: string; familyName: string };
};

async function getDrivers(): Promise<DriverStanding[]> {
  try {
    const res = await fetch(
      "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
      { next: { revalidate: 900 }, headers: { Accept: "application/json" } }
    );
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("application/json")) {
      console.error("Driver standings unavailable:", res.status);
      return [];
    }
    const data = await res.json();
    return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  } catch (error) {
    console.error("Driver standings error:", error);
    return [];
  }
}

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)", color: "white", padding: "24px", paddingBottom: "100px", fontFamily: "Arial" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Link href="/results" style={{ color: "white" }}>Race</Link>
        <Link href="/results/drivers" style={{ color: "white" }}>Drivers</Link>
        <Link href="/results/constructors" style={{ color: "white" }}>Constructors</Link>
      </div>
      <h1>👨‍🏎️ Driver Championship</h1>
      {drivers.map((driver) => (
        <div key={`${driver.Driver?.givenName ?? ""}-${driver.Driver?.familyName ?? driver.position}`} style={{ background: "#131942", padding: "15px", marginTop: "10px", borderRadius: "12px" }}>
          {driver.position}. {driver.Driver?.givenName ?? ""} {driver.Driver?.familyName ?? "Unknown driver"} — {driver.points} pts
        </div>
      ))}
      {drivers.length === 0 && <p style={{ color: "#bdb6ff" }}>드라이버 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
    </main>
  );
}
