const teams = [
  { id: "mclaren", name: "McLaren" },
  { id: "ferrari", name: "Ferrari" },
  { id: "red_bull", name: "Red Bull Racing" },
  { id: "mercedes", name: "Mercedes" },
  { id: "aston_martin", name: "Aston Martin" },
  { id: "alpine", name: "Alpine" },
  { id: "williams", name: "Williams" },
  { id: "racing_bulls", name: "Racing Bulls" },
  { id: "haas", name: "Haas" },
  { id: "audi", name: "Audi" },
  { id: "cadillac", name: "Cadillac" },
];

type CommonsImage = {
  title?: string;
  thumbnail?: { source?: string };
  imageinfo?: { extmetadata?: { Artist?: { value?: string }; LicenseShortName?: { value?: string }; LicenseUrl?: { value?: string } } }[];
};

async function findCarPhoto(team: { id: string; name: string }) {
  const searches = [
    `${team.name} Formula One 2026 car`,
    `${team.name} Formula One car 2025`,
  ];
  for (const query of searches) {
    try {
      const url = new URL("https://commons.wikimedia.org/w/api.php");
      url.searchParams.set("action", "query");
      url.searchParams.set("generator", "search");
      url.searchParams.set("gsrsearch", query);
      url.searchParams.set("gsrnamespace", "6");
      url.searchParams.set("gsrlimit", "8");
      url.searchParams.set("prop", "imageinfo");
      url.searchParams.set("iiprop", "url|extmetadata");
      url.searchParams.set("iiurlwidth", "1000");
      url.searchParams.set("format", "json");
      const response = await fetch(url, { next: { revalidate: 86400 } });
      if (!response.ok) continue;
      const json = await response.json();
      const pages: CommonsImage[] = Object.values(json?.query?.pages ?? {});
      const candidate = pages.find((page) => {
        const title = (page.title ?? "").toLowerCase();
        return Boolean(page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url)
          && title.includes("2026")
          && (title.includes("car") || title.includes("grand prix") || title.includes("formula"))
          && !title.includes("logo");
      }) ?? pages.find((page) => Boolean(page.thumbnail?.source) && !String(page.title).toLowerCase().includes("logo"));
      const imageUrl = candidate?.imageinfo?.[0]?.thumburl ?? candidate?.imageinfo?.[0]?.url;\n      if (imageUrl) {
        const meta = candidate.imageinfo?.[0]?.extmetadata;
        return {
          id: team.id,
          name: team.name,
          imageUrl,
          sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(candidate.title ?? "").replace(/%3A/g, ":").replace(/%20/g, "_")}`,
          credit: (meta?.Artist?.value ?? "Wikimedia Commons").replace(/<[^>]*>/g, "").slice(0, 180),
          license: meta?.LicenseShortName?.value ?? "Wikimedia Commons",
          licenseUrl: meta?.LicenseUrl?.value ?? "https://commons.wikimedia.org/",
        };
      }
    } catch {
      // Try the next search query; team page keeps its illustrated fallback if no photo is found.
    }
  }
  return { id: team.id, name: team.name, imageUrl: null, sourceUrl: null, credit: null, license: null, licenseUrl: null };
}

export async function GET() {
  try {
    const images = await Promise.all(teams.map(findCarPhoto));
    return Response.json(images, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (error) {
    console.error("Team car photos API error:", error);
    return Response.json({ error: "Failed to load team car photos" }, { status: 500 });
  }
}
