export default function SchedulePage() {
  const races = [
    "🇸🇬 Singapore Grand Prix",
    "🇯🇵 Japanese Grand Prix",
    "🇶🇦 Qatar Grand Prix",
    "🇦🇪 Abu Dhabi Grand Prix",
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
      <h1>📅 2026 Race Schedule</h1>

      <div
        style={{
          background: "#131942",
          borderRadius: "20px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        {races.map((race, index) => (
          <div
            key={index}
            style={{
              padding: "15px 0",
              borderBottom: "1px solid #2b347a",
            }}
          >
            {race}
          </div>
        ))}
      </div>
    </main>
  );
}
