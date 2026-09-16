type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
};

export default async function NewsPage() {
  const res = await fetch(
    `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""}/api/news`,
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

      <h1>📰 F1 News</h1>

      <div
        style={{
          display: "grid",
          gap: "20px",
          marginTop: "30px",
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
              }}
            >
              <h2>{item.title}</h2>

              <p style={{ color: "#a9adff" }}>
                {item.pubDate.split(" ")[0]}
              </p>

              <p>Read Article →</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
