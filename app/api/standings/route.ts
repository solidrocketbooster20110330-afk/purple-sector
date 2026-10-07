const API = "https://api.jolpi.ca/ergast/f1/current/driverstandings.json";

export async function GET() {
  try {
    const res = await fetch(API, { next: { revalidate: 900 } });
    if (!res.ok) {
      return Response.json({ error: "Failed to load driver standings" }, { status: 502 });
    }
    const data = await res.json();
    const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    return Response.json(standings);
  } catch (error) {
    console.error("Standings API error:", error);
    return Response.json({ error: "Failed to load driver standings" }, { status: 500 });
  }
}
