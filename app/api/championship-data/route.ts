type DriverStanding = { Driver: { driverId: string; givenName: string; familyName: string; permanentNumber?: string }; position: string; points: string; Constructors?: { name: string }[] };
type ConstructorStanding = { Constructor: { constructorId: string; name: string }; position: string; points: string };
type RaceResult = { Driver?: { driverId?: string }; Constructor?: { constructorId?: string }; points?: string };
type Race = { round: string; Results?: RaceResult[]; SprintResults?: RaceResult[]; [key: string]: any };

const SEASON = "2026";
const API = "https://api.jolpi.ca/ergast/f1";
const PAGE_SIZE = 100;

async function jsonOrNull(response: Response) {
  if (!response.ok) return null;
  try { return await response.json(); } catch { return null; }
}

async function fetchJson(url: string) {
  return jsonOrNull(await fetch(url, { next: { revalidate: 900 } }));
}

async function fetchAllRacePages(resource: "results" | "sprint", firstPage: any) {
  const total = Number(firstPage?.MRData?.total ?? 0);
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      fetchJson(`${API}/${SEASON}/${resource}.json?limit=${PAGE_SIZE}&offset=${(index + 1) * PAGE_SIZE}`)
    )
  );
  const byRound = new Map<string, Race>();
  for (const page of [firstPage, ...rest]) {
    const races: Race[] = page?.MRData?.RaceTable?.Races ?? [];
    for (const race of races) {
      const round = String(race.round);
      const current = byRound.get(round) ?? { ...race, Results: [], SprintResults: [] };
      if (resource === "results") current.Results = [...(current.Results ?? []), ...(race.Results ?? [])];
      else current.SprintResults = [...(current.SprintResults ?? []), ...(race.SprintResults ?? [])];
      byRound.set(round, current);
    }
  }
  return byRound;
}

export async function GET() {
  try {
    // Fetch the season result tables in pages instead of requesting each round separately.
    const [standingsData, scheduleData, constructorData, firstResultsPage, firstSprintPage] = await Promise.all([
      fetchJson(`${API}/${SEASON}/driverstandings.json`),
      fetchJson(`${API}/${SEASON}.json`),
      fetchJson(`${API}/${SEASON}/constructorstandings.json`),
      fetchJson(`${API}/${SEASON}/results.json?limit=${PAGE_SIZE}&offset=0`),
      fetchJson(`${API}/${SEASON}/sprint.json?limit=${PAGE_SIZE}&offset=0`),
    ]);
    if (!standingsData || !scheduleData || !constructorData || !firstResultsPage || !firstSprintPage) {
      return Response.json({ error: "Championship data is temporarily unavailable" }, { status: 502 });
    }

    const [raceResultsByRound, sprintResultsByRound] = await Promise.all([
      fetchAllRacePages("results", firstResultsPage),
      fetchAllRacePages("sprint", firstSprintPage),
    ]);
    const scheduledRaces: Race[] = scheduleData?.MRData?.RaceTable?.Races ?? [];
    const roundData: (Race | null)[] = scheduledRaces.map((scheduledRace) => {
      const round = String(scheduledRace.round);
      const Results = raceResultsByRound.get(round)?.Results ?? [];
      const SprintResults = sprintResultsByRound.get(round)?.SprintResults ?? [];
      if (Results.length === 0 && SprintResults.length === 0) return null;
      return { ...scheduledRace, Results, SprintResults };
    });

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
