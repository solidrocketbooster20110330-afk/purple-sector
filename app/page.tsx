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
          marginBottom: "40px",
        }}
      >
        Ultimate Formula 1 Dashboard
      </p>

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
          <p>Loading...</p>
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
          <p>Loading...</p>
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
          <p>Loading...</p>
        </div>
      </div>
    </main>
  );
}
