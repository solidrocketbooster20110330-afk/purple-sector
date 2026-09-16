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
    data.MRData.StandingsTable.StandingsLists[0]
      .ConstructorStandings;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <a href="/results">Race</a>
        <a href="/results/drivers">Drivers</a>
        <a href="/results/constructors">
          Constructors
        </a>
      </div>

      <h1>🏆 Constructor Championship</h1>

      {constructors.map((team) => (
        <div
          key={team.position}
          style={{
            background: "#131942",
            padding: "15px",
            marginTop: "10px",
            borderRadius: "12px",
          }}
        >
          {team.position}.{" "}
          {team.Constructor.name}
          {" — "}
          {team.points} pts
        </div>
      ))}
    </main>
  );
}
