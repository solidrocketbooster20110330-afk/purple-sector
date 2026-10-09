export async function GET() {
  try {
    const res = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml",
      { next: { revalidate: 900 } }
    );
    if (!res.ok) {
      return Response.json([], { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
    }
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items.slice(0, 10) : [];
    return Response.json(items, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch (error) {
    console.error("News API error:", error);
    return Response.json([], { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  }
}
