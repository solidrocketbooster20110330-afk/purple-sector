const API = "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json";

export async function GET() {
  try {
    const res = await fetch(API, { next: { revalidate: 900 } });
    if (!res.ok) {
      return Response.json({ error: "Failed to load constructor standings" }, { status: 502 });
    }
    const data = await res.json();
    const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
    return Response.json(standings);
  } catch (error) {
    console.error("Constructors API error:", error);
    return Response.json({ error: "Failed to load constructor standings" }, { status: 500 });
  }
}
