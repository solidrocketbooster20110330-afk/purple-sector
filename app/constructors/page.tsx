import Link from "next/link";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: { name: string };
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

export default async function ConstructorsPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();

  const constructors: ConstructorStanding[] =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  return (
    <main style={pageStyle}>
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
            padding: "14px",
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
                  : "1px solid #2b347a",
            }}
          >
            <span>
              {team.position === "1"
                ? "🥇"
                : team.position === "2"
                ? "🥈"
                : team.position === "3"
                ? "🥉"
                : `P${team.position}`}{" "}
              {team.Constructor.name}
            </span>
            <strong>{team.points} pts</strong>
          </div>
        ))}

        {constructors.length === 0 && (
          <p style={{ color: "#a9adff" }}>Constructor 데이터가 없습니다.</p>
        )}
      </div>
    </main>
  );
}
