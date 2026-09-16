type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: {
    name: string;
  };
};

export default async function ConstructorsPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
    {
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();

  const constructors: ConstructorStanding[] =
    data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;

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

      <h1>🏆 Constructor Championship</h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "30px",
        }}
      >
        Live Formula 1 Constructor Standings
      </p>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        {constructors.map((team, index) => (
          <div
            key={team.position}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom:
                index === constructors.length - 1
                  ? "none"
                  : "1px solid #2b347a",
              fontSize: "20px",
            }}
          >
            <span>
              {team.position}. {team.Constructor.name}
            </span>

            <strong>{team.points} pts</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
