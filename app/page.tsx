export default function HomePage() {
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
          marginBottom: "20px",
        }}
      >
        Ultimate Formula 1 Dashboard
      </p>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "35px",
        }}
      >
        <a
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
            background: "#1a2157",
            padding: "10px 18px",
            borderRadius: "10px",
          }}
        >
          🏠 Home
        </a>

        <a
          href="/standings"
          style={{
            color: "white",
            textDecoration: "none",
            background: "#1a2157",
            padding: "10px 18px",
            borderRadius: "10px",
          }}
        >
          🏆 Standings
        </a>

        <a
          href="/schedule"
          style={{
            color: "white",
            textDecoration: "none",
            background: "#1a2157",
            padding: "10px 18px",
            borderRadius: "10px",
          }}
        >
          📅 Schedule
        </a>
        <a
  href="/news"
  style={{
    color: "white",
    textDecoration: "none",
    background: "#1a2157",
    padding: "10px 18px",
    borderRadius: "10px",
  }}
>
  📰 News
</a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "20px",
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
          <h2>🏁 Next Race</h2>

          <h3>Singapore Grand Prix</h3>
          <p>📅 Sept 20, 2026</p>
          <p>📍 Marina Bay Street Circuit</p>
        </div>

        <div
          style={{
            background: "#131942",
            border: "1px solid #2b347a",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <h2>👨‍🏎️ Driver Standings</h2>

          <div style={{ lineHeight: "1.8" }}>
            <div>1. #1 Max Verstappen - 412</div>
            <div>2. #4 Lando Norris - 387</div>
            <div>3. #63 George Russell - 301</div>
            <div>4. #16 Charles Leclerc - 287</div>
            <div>5. #81 Oscar Piastri - 271</div>
          </div>
        </div>

        <div
          style={{
            background: "#131942",
            border: "1px solid #2b347a",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <h2>🏆 Constructor Standings</h2>

          <div style={{ lineHeight: "1.8" }}>
            <div>1. McLaren - 658</div>
            <div>2. Red Bull Racing - 602</div>
            <div>3. Mercedes - 519</div>
            <div>4. Ferrari - 487</div>
            <div>5. Aston Martin - 211</div>
          </div>
        </div>

        <div
          style={{
            background: "#131942",
            border: "1px solid #2b347a",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <h2>📰 Latest News</h2>

          <div style={{ lineHeight: "1.8" }}>
            <div>• Verstappen extends championship lead</div>
            <div>• McLaren wins constructor battle</div>
            <div>• Singapore GP preparations underway</div>
          </div>
        </div>
      </div>
    </main>
  );
}
