import Link from "next/link";

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
    { next: { revalidate: 3600 } }
  );

  const data = await res.json();
  const constructors: ConstructorStanding[] =
    data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#2b2f33",
        color: "#f2f2f2",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginTop: 0 }}>🏆 Constructors Championship</h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          margin: "24px 0 20px",
        }}
      >
        <Link
          href="/championship"
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "16px",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: "bold",
            background: "#3a3f45",
            border: "1px solid #5a6169",
            color: "white",
          }}
        >
          👤 Drivers
        </Link>
        <Link
          href="/championship/constructors"
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "16px",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: "bold",
            background: "#7c3aed",
            border: "1px solid #5a6169",
            color: "white",
          }}
        >
          🏭 Constructors
        </Link>
      </div>

      <div
        style={{
          background: "#3a3f45",
          border: "1px solid #5a6169",
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
              gap: "16px",
              padding: "16px 0",
              borderBottom:
                index === constructors.length - 1
                  ? "none"
                  : "1px solid #555b62",
            }}
          >
            <span>
              {team.position === "1"
                ? "🥇"
                : team.position === "2"
                ? "🥈"
                : team.position === "3"
                ? "🥉"
                : "P" + team.position}{" "}
              {team.Constructor.name}
            </span>
            <strong>{team.points} pts</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
