export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f23",
        color: "white",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>🟣 PurpleSector</h1>
      <p>F1 Dashboard</p>

      <h2>Features</h2>

      <ul>
        <li>Next Race Schedule</li>
        <li>Driver Standings</li>
        <li>Constructor Standings</li>
        <li>Latest F1 News</li>
      </ul>
    </main>
  );
}
