export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#070b2d",
        color: "white",
        padding: "24px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          marginBottom: "10px",
        }}
      >
        🟣 PurpleSector
      </h1>

      <p
        style={{
          color: "#b8b8ff",
          marginBottom: "30px",
        }}
      >
        Ultimate F1 Dashboard
      </p>

      <div
        style={{
          display: "grid",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "#121842",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h2>🏁 Next Race</h2>
          <p>Azerbaijan Grand Prix</p>
        </div>

        <div
          style={{
            background: "#121842",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h2>👨‍🏎️ Driver Standings</h2>
          <p>Championship standings coming soon...</p>
        </div>

        <div
          style={{
            background: "#121842",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h2>🏆 Constructor Standings</h2>
          <p>Constructor standings coming soon...</p>
        </div>

        <div
          style={{
            background: "#121842",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h2>📰 Latest News</h2>
          <p>Latest F1 headlines coming soon...</p>
        </div>
      </div>
    </main>
  );
}
