export default function HomePage() {
  const navBtn = {
    background: "#131942",
    border: "1px solid #2b347a",
    borderRadius: "12px",
    padding: "10px 18px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-block",
  };

  const cardStyle = {
    background: "#131942",
    border: "1px solid #2b347a",
    borderRadius: "20px",
    padding: "20px",
  };

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
      <h1
        style={{
          fontSize: "56px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        🟣 PurpleSector
      </h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "30px",
        }}
      >
        Ultimate Formula 1 Dashboard
      </p>

      <nav
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <a href="/" style={navBtn}>
          🏠 Home
        </a>

        <a href="/schedule" style={navBtn}>
          📅 Schedule
        </a>

        <a href="/standings" style={navBtn}>
          🏆 Standings
        </a>

        <a href="/news" style={navBtn}>
          📰 News
        </a>
        <a href="/results" style={navBtn}>
  🏁 Results
</a>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h2>🏁 Next Race</h2>

          <h3>Singapore Grand Prix</h3>

          <p>📅 Sept 20, 2026</p>

          <p>📍 Marina Bay Street Circuit</p>
        </div>

        <div style={cardStyle}>
          <h2>👨‍🏎️ Driver Standings</h2>

          <div style={{ lineHeight: "2" }}>
            <div>🥇 #1 Max Verstappen — 412</div>
            <div>🥈 #4 Lando Norris — 387</div>
            <div>🥉 #63 George Russell — 301</div>
            <div>4️⃣ #16 Charles Leclerc — 287</div>
            <div>5️⃣ #81 Oscar Piastri — 271</div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>🏆 Constructor Standings</h2>

          <div style={{ lineHeight: "2" }}>
            <div>🥇 McLaren — 658</div>
            <div>🥈 Red Bull Racing — 602</div>
            <div>🥉 Mercedes — 519</div>
            <div>4️⃣ Ferrari — 487</div>
            <div>5️⃣ Aston Martin — 211</div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>📰 Latest News</h2>

          <div style={{ lineHeight: "2" }}>
            <div>• Verstappen extends championship lead</div>
            <div>• McLaren wins constructor battle</div>
            <div>• Singapore GP preparations underway</div>
          </div>
        </div>
      </div>
    </main>
  );
}
