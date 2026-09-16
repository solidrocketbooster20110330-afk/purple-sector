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
      <h1 style={{ color: "#a855f7" }}>🟣 PurpleSector</h1>

      <h2>F1 Dashboard</h2>

      <p>Welcome to PurpleSector.</p>

      <ul>
        <li>Next Grand Prix</li>
        <li>Previous Race Result</li>
        <li>Driver Standings</li>
        <li>Constructor Standings</li>
        <li>Latest F1 News</li>
      </ul>
    </main>
  );
}
