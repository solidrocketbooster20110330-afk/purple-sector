type NewsItem = {
  title: string;
  link: string;
  pubDate: string | null;
};

async function getNews() {
  const res = await fetch(
    "https://purple-sector-six.vercel.app/api/news",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function NewsPage() {
  const news: NewsItem[] = await getNews();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05071f",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
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
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "white",
            }}
          >
            <div
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
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
