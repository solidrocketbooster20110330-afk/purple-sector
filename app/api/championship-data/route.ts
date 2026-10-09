type DriverStanding = { Driver: { driverId: string; givenName: string; familyName: string; permanentNumber?: string }; position: string; points: string; Constructors?: { name: string }[] };
type ConstructorStanding = { Constructor: { constructorId: string; name: string }; position: string; points: string };
type RaceResult = { Driver?: { driverId?: string }; Constructor?: { constructorId?: string }; points?: string };
type Race = { round: string; Results?: RaceResult[]; SprintResults?: RaceResult[]; [key: string]: unknown };
const SEASON = "2026";
const API = "https://api.jolpi.ca/ergast/f1";
async function jsonOrNull(response: Response) {
  if (!response.ok) return null;
  try { return await response.json(); } catch { return null; }
}
export async function GET() {
  try {
    const [standingsResponse, scheduleResponse, constructorResponse] = await Promise.all([
      fetch(`${API}/${SEASON}/driverstandings.json`),
      fetch(`${API}/${SEASON}.json`),
      fetch(`${API}/${SEASON}/constructorstandings.json`),
    ]);
    const [standingsData, scheduleData, constructorData] = await Promise.all([
      jsonOrNull(standingsResponse), jsonOrNull(scheduleResponse), jsonOrNull(constructorResponse),
    ]);
    if (!standingsData || !scheduleData || !constructorData) {
      return Response.json({ error: "Championship data is temporarily unavailable" }, { status: 502 });
    }
    const scheduledRaces: Race[] = scheduleData?.MRData?.RaceTable?.Races ?? [];
    const roundData: (Race | null)[] = new Array(scheduledRaces.length).fill(null);
    const batchSize = 4;
    for (let start = 0; start < scheduledRaces.length; start += batchSize) {
      const batch = scheduledRaces.slice(start, start + batchSize);
      const items = await Promise.all(batch.map(async (scheduledRace) => {
        const round = scheduledRace.round;
        try {
          const [raceResponse, sprintResponse] = await Promise.all([
            fetch(`${API}/${SEASON}/${round}/results.json`),
            fetch(`${API}/${SEASON}/${round}/sprint.json`),
          ]);
          const [racePage, sprintPage] = await Promise.all([jsonOrNull(raceResponse), jsonOrNull(sprintResponse)]);
          const race = racePage?.MRData?.RaceTable?.Races?.[0];
          const sprintRace = sprintPage?.MRData?.RaceTable?.Races?.[0];
          const Results = race?.Results ?? [];
          const SprintResults = sprintRace?.SprintResults ?? [];
          return Results.length || SprintResults.length ? { ...(race ?? scheduledRace), Results, SprintResults } : null;
        } catch { return null; }
      }));
      items.forEach((item, index) => { roundData[start + index] = item; });
    }
    return Response.json({
      standingsData, scheduleData, roundData,
      drivers: standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [],
      constructors: constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [],
    }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch (error) {
    console.error("Championship API error:", error);
    return Response.json({ error: "Failed to load championship data" }, { status: 500 });
  }
}
