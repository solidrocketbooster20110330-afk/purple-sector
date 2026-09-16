export default function ResultsPage() {
  const results = [
    ["Max Verstappen", "Red Bull Racing"],
    ["Lando Norris", "McLaren"],
    ["George Russell", "Mercedes"],
    ["Charles Leclerc", "Ferrari"],
    ["Oscar Piastri", "McLaren"],
  ];

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

      <h1>🏁 Last Race Results</h1>
      <p style={{ color: "#a9adff" }}>
        Latest Grand Prix Classification
      </p>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        {results.map((driver, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "15px 0",
              borderBottom:
                index === results.length - 1
                  ? "none"
                  : "1px solid #2b347a",
            }}
          >
            <span>
              {index + 1}. {driver[0]}
            </span>

            <span>{driver[1]}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2>⚡ Fastest Lap</h2>
        <p>#81 Oscar Piastri</p>
      </div>
    </main>
  );
}
