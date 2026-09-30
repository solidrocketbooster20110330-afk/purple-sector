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
  background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
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
          background: "#1a2157",
          padding: "10px 18px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        ← Home
      </a>

      <h1>📰 Latest F1 News</h1>

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
                background: "#131942",
                border: "1px solid #2b347a",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <h2>{item.title}</h2>
              <p style={{ color: "#a9adff" }}>
                {item.pubDate || "Formula1.com"}
              </p>
              <p>Read Article →</p>
            </article>
          </a>
        ))}

        {news.length === 0 && (
          <p style={{ color: "#a9adff" }}>뉴스 데이터를 불러오지 못했습니다.</p>
        )}
      </div>
    </main>
  );
}
