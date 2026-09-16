export default function StandingsPage() {
  const drivers = [
    ["#1 Max Verstappen", 412],
    ["#4 Lando Norris", 387],
    ["#63 George Russell", 301],
    ["#16 Charles Leclerc", 287],
    ["#81 Oscar Piastri", 271],
    ["#44 Lewis Hamilton", 243],
    ["#55 Carlos Sainz", 221],
    ["#14 Fernando Alonso", 168],
    ["#22 Yuki Tsunoda", 112],
    ["#23 Alex Albon", 91],
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05071f",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>🏆 Driver Championship</h1>

      <div
        style={{
          background: "#131942",
          borderRadius: "20px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        {drivers.map((driver, index) => (
          <div
            key={index}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #2b347a",
            }}
          >
            {index + 1}. {driver[0]} — {driver[1]} pts
          </div>
        ))}
      </div>
    </main>
  );
}
