const API = "https://api.openf1.org/v1/drivers?session_key=latest";

export async function GET() {
  try {
    const response = await fetch(API, { next: { revalidate: 21600 } });
    if (!response.ok) {
      return Response.json({ error: "Driver photo source unavailable" }, { status: 502 });
    }
    const data = await response.json();
    const photos = (Array.isArray(data) ? data : [])
      .filter((driver: any) => driver?.headshot_url)
      .map((driver: any) => ({
        fullName: String(driver.full_name ?? driver.broadcast_name ?? "").replace(/\s+/g, " ").trim(),
        firstName: String(driver.first_name ?? "").trim(),
        lastName: String(driver.last_name ?? "").trim(),
        acronym: String(driver.name_acronym ?? "").trim().toUpperCase(),
        teamName: String(driver.team_name ?? "").trim(),
        headshotUrl: String(driver.headshot_url),
      }));
    return Response.json(photos, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
  } catch (error) {
    console.error("Driver photos API error:", error);
    return Response.json({ error: "Failed to load driver photos" }, { status: 500 });
  }
}
