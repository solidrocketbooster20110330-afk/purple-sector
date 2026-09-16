export default function ConstructorsPage() {
  const teams = [
    ["McLaren", 658],
    ["Red Bull Racing", 602],
    ["Mercedes", 519],
    ["Ferrari", 487],
    ["Aston Martin", 211],
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
      <h1
        style={{
          fontSize: "42px",
          marginBottom: "10px",
        }}
      >
        🏆 Constructor Championship
      </h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "30px",
        }}
      >
        2026 Formula 1 Constructor Standings
      </p>

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

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        {teams.map((team, index) => (
          <div
            key={team[0]}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom:
                index === teams.length - 1
                  ? "none"
                  : "1px solid #2b347a",
              fontSize: "20px",
            }}
          >
            <span>
              {index + 1}. {team[0]}
            </span>

            <strong>{team[1]} pts</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
