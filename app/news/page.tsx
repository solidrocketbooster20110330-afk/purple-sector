import BottomNav from "../components/BottomNav";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string | null;
};

async function getNews(): Promise<NewsItem[]> {
  const res = await fetch("https://purple-sector-six.vercel.app/api/news", {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

export default async function NewsPage() {
  const news = await getNews();

  return (
    <main style={pageStyle}>
      <a
        href="/"
        style={{
          display: "inline-block",
          color: "white",
          textDecoration: "none",
          background: "#171717",
          border: "1px solid #3a171b",
          padding: "10px 18px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        ← Home
      </a>

      <h1 style={{ marginBottom: "8px" }}>📰 Latest F1 News</h1>
      <div
        style={{
          width: "54px",
          height: "4px",
          background: "#ef233c",
          borderRadius: "999px",
          marginBottom: "20px",
        }}
      />

      <div
        style={{
          display: "grid",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {news.slice(0, 10).map((item, index) => (
          <a
            key={item.link || index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "white" }}
          >
            <article
              style={{
                background: "#111111",
                border: "1px solid #3a171b",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{item.title}</h2>
              <p style={{ color: "#b66b72" }}>
                {item.pubDate || "Formula1.com"}
              </p>
              <p style={{ color: "#ef233c", fontWeight: "bold" }}>
                Read Article →
              </p>
            </article>
          </a>
        ))}

        {news.length === 0 && (
          <p style={{ color: "#b66b72" }}>뉴스 데이터를 불러오지 못했습니다.</p>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
