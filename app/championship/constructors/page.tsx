import Link from "next/link";
import BottomNav from "../../components/BottomNav";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: {
    name: string;
  };
};

export default async function ChampionshipConstructorsPage() {
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
        background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "24px",
          marginBottom: "20px",
        }}
      >
        <Link
          href="/championship"
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "16px",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: "bold",
            background: "#131942",
            border: "1px solid #2b347a",
            color: "white",
          }}
        >
          👤 Drivers
        </Link>

        <Link
          href="/championship/constructors"
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "16px",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: "bold",
            background: "#7c3aed",
            border: "1px solid #2b347a",
            color: "white",
          }}
        >
          🏭 Constructors
        </Link>
      </div>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        {constructors.map((constructor) => (
          <div
            key={constructor.position}
            style={{
              padding: "14px 0",
              borderBottom: "1px solid #2b347a",
            }}
          >
            <strong style={{ marginRight: "10px" }}>
              {constructor.position === "1"
                ? "🥇"
                : constructor.position === "2"
                ? "🥈"
                : constructor.position === "3"
                ? "🥉"
                : `P${constructor.position}`}
            </strong>

            <div>{constructor.Constructor.name}</div>
            <div style={{ marginTop: "4px" }}>{constructor.points} pts</div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
