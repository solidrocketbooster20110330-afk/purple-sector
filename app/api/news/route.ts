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
      signal: AbortSignal.timeout(2000),
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

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function readTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] ? decodeXml(match[1]) : "";
}

function parseRss(xml: string): RawNewsItem[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
    .slice(0, 10)
    .map((match) => {
      const item = match[1];
      const enclosure = item.match(/<enclosure[^>]+url=["']([^"']+)["']/i)?.[1] ?? "";
      const media = item.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1] ?? "";
      return {
        title: readTag(item, "title"),
        link: readTag(item, "link"),
        pubDate: readTag(item, "pubDate"),
        description: readTag(item, "description"),
        thumbnail: enclosure || media || imageFromItem({
          content: readTag(item, "content:encoded"),
          description: readTag(item, "description"),
        }),
      };
    })
    .filter((item) => Boolean(item.title && item.link));
}

async function fetchDirectRss(url: string): Promise<RawNewsItem[]> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PurpleSector/1.0)" },
      cache: "no-store",
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) return [];
    return parseRss(await response.text());
  } catch {
    return [];
  }
}

export async function GET() {
  const headers = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" };
  try {
    const sources = [
      "https://www.formula1.com/en/latest/all.xml",
      "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
    ];

    // Try the JSON converter first, then fall back to direct RSS feeds if it is down or rate-limited.
    try {
      const res = await fetch(
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml",
        { cache: "no-store", signal: AbortSignal.timeout(4500) }
      );
      if (res.ok) {
        const data = await res.json();
        const rawItems: RawNewsItem[] = Array.isArray(data?.items)
          ? data.items.filter((item: RawNewsItem) => item.title && item.link).slice(0, 10)
          : [];
        if (rawItems.length > 0) {
          const items = await Promise.all(rawItems.map(async (item) => ({
            ...item,
            thumbnail: imageFromItem(item) || await imageFromArticle(item.link ?? ""),
          })));
          return Response.json(items, { headers });
        }
      }
    } catch {
      // Continue with direct RSS fallback.
    }

    for (const source of sources) {
      const items = await fetchDirectRss(source);
      if (items.length > 0) return Response.json(items, { headers });
    }

    console.error("News API: all RSS sources returned no items");
    return Response.json({ error: "News sources are temporarily unavailable" }, { status: 502, headers });
  } catch (error) {
    console.error("News API error:", error);
    return Response.json({ error: "Failed to load F1 news" }, { status: 502, headers });
  }
}
