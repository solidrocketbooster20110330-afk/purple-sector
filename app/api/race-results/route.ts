const API = "https://api.jolpi.ca/ergast/f1";

type ApiResponse = {
  MRData?: {
    RaceTable?: {
      Races?: Array<Record<string, unknown> & {
        Results?: unknown[];
        QualifyingResults?: unknown[];
      }>;
    };
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") ?? "";
  const round = searchParams.get("round") ?? "";
  const type = searchParams.get("type") ?? "race";

  if (!/^\d{4}$/.test(season) || !/^\d{1,2}$/.test(round) || !["race", "qualifying"].includes(type)) {
    return Response.json({ error: "Invalid season, round, or result type" }, { status: 400 });
  }

  const resource = type === "qualifying" ? "qualifying" : "results";
  const field = type === "qualifying" ? "QualifyingResults" : "Results";

  try {
    // Fetch on the server so the upstream API receives the identifying User-Agent it requests.
    const upstream = await fetch(`${API}/${season}/${round}/${resource}.json`, {
      cache: "no-store",
      headers: { "User-Agent": "PurpleSector/1.0 (F1 results client)" },
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      return Response.json({ error: "Upstream F1 results request failed" }, { status: 502 });
    }

    const data = (await upstream.json()) as ApiResponse;
    const race = data?.MRData?.RaceTable?.Races?.[0] ?? null;
    const results = Array.isArray(race?.[field]) ? race[field] : [];

    return Response.json({
      season,
      round,
      type,
      raceName: race?.raceName ?? null,
      results,
      hasResults: results.length > 0,
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
    });
  } catch (error) {
    console.error("Race results API error:", error);
    return Response.json({ error: "Failed to load F1 results" }, { status: 502 });
  }
}
