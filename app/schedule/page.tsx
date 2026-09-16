export default function SchedulePage() {
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

      <h1>📅 Next Race Schedule</h1>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "25px",
          marginTop: "20px",
        }}
      >
        <h2>🇸🇬 Singapore Grand Prix</h2>
        <p>📅 Sept 20, 2026</p>
        <p>📍 Marina Bay Street Circuit</p>
      </div>
    </main>
  );
}
