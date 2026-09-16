export async function GET() {
  const res = await fetch(
    "https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml"
  );

  const data = await res.json();

  return Response.json(data.items?.slice(0, 10) || []);
}
