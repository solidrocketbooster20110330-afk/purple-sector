type NewsItem = {
  title: string;
  link: string;
  pubDate: string | null;
};

export default async function NewsPage() {
  const res = await fetch(
    "https://purple-sector-li6kv4p9g-purple-delta2.vercel.app/api/news",
    {
      cache: "no-store",
    }
  );

  const news: NewsItem[] = await res.json();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
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

      <h1
        style={{
          fontSize: "42px",
          marginBottom: "10px",
        }}
      >
        📰 F1 News
      </h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "30px",
        }}
      >
        Latest Formula 1 Headlines
      </p>

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {news.map((item, index) => (
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
                transition: "0.2s",
              }}
            >
              <h2>{item.title}</h2>

              <p
                style={{
                  color: "#a9adff",
                }}
              >
                {item.pubDate || "Latest"}
              </p>

              <p>🔗 Read Article</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
