export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "24px",
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

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/"
          style={{
            color: "#a855f7",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          🏠 Home
        </a>

        <a
          href="/schedule"
          style={{
            color: "#a855f7",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          📅 Schedule
        </a>

        <a
          href="/standings"
          style={{
            color: "#a855f7",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          🏆 Standings
        </a>

        <a
          href="/news"
          style={{
            color: "#a855f7",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          📰 News
        </a>
      </div>

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
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#131942",
            border:
