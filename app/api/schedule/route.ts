const API = "https://api.jolpi.ca/ergast/f1/current.json";

export async function GET() {
  try {
    const res = await fetch(API, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return Response.json({ error: "Failed to load schedule" }, { status: 502 });
    }
    const data = await res.json();
    const races = data?.MRData?.RaceTable?.Races ?? [];
    return Response.json(races);
  } catch (error) {
    console.error("Schedule API error:", error);
    return Response.json({ error: "Failed to load schedule" }, { status: 500 });
  }
}
