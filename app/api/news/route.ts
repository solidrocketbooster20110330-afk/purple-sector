type RawNewsItem = {
  title?: string;
  link?: string;
  thumbnail?: string;
  enclosure?: { link?: string };
  content?: string;
  description?: string;
  [key: string]: unknown;
};

function imageFromItem(item: RawNewsItem): string {
  if (item.thumbnail) return item.thumbnail;
  if (item.enclosure?.link) return item.enclosure.link;
  const html = String(item.content ?? "") + " " + String(item.description ?? "");
  return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? "";
}

async function imageFromArticle(url: string): Promise<string> {
  if (!url.startsWith("https://") && !url.startsWith("http://")) return "";
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 21600 },
    });
    if (!response.ok) return "";
    const html = await response.text();
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1].replace(/&amp;/g, "&");
    }
  } catch {
    // Keep the thumbnail optional if the publisher blocks the request.
  }
  return "";
}

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
    const rawItems: RawNewsItem[] = Array.isArray(data?.items) ? data.items.slice(0, 10) : [];
    const items = await Promise.all(
      rawItems.map(async (item) => ({
        ...item,
        thumbnail: imageFromItem(item) || await imageFromArticle(item.link ?? ""),
      }))
    );

    return Response.json(items, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
    });
  } catch (error) {
    console.error("News API error:", error);
    return Response.json([], { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  }
}
