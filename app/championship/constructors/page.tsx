import Link from "next/link";
import BottomNav from "../../components/BottomNav";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: { name: string };
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#131942",
  border: "1px solid #2b347a",
  borderRadius: "20px",
  padding: "20px",
  maxHeight: "600px",
  overflowY: "auto" as const,
};

const tabsStyle = {
  display: "flex",
  gap: "12px",
  margin: "24px 0 20px",
};

const tabStyle = {
  flex: 1,
  padding: "14px 18px",
  borderRadius: "16px",
  textAlign: "center" as const,
  textDecoration: "none",
  fontWeight: "bold",
  border: "1px solid #2b347a",
  color: "white",
};

function positionLabel(position: string) {
  if (position === "1") return "🥇";
  if (position === "2") return "🥈";
  if (position === "3") return "🥉";
  return `P${position}`;
}

export default async function ChampionshipConstructorsPage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/2026/constructorstandings.json",
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();

  const constructors: ConstructorStanding[] =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  return (
    <main style={pageStyle}>
      <h1 style={{ marginTop: 0 }}>🏆 Championship</h1>

      <div style={tabsStyle}>
        <Link
          href="/championship"
          style={{ ...tabStyle, background: "#131942" }}
        >
          👤 Drivers
        </Link>
        <Link
          href="/championship/constructors"
          style={{ ...tabStyle, background: "#7c3aed" }}
        >
          🏭 Constructors
        </Link>
      </div>

      <div style={cardStyle}>
        {constructors.length === 0 ? (
          <p style={{ color: "#a9adff" }}>
            Constructor 데이터가 없습니다.
          </p>
        ) : (
          constructors.map((constructor, index) => (
            <div
              key={constructor.position}
              style={{
                padding: "14px 0",
                borderBottom:
                  index === constructors.length - 1
                    ? "none"
                    : "1px solid #2b347a",
              }}
            >
              <strong>{positionLabel(constructor.position)}</strong>
              <div>{constructor.Constructor.name}</div>
              <div style={{ marginTop: "4px" }}>
                {constructor.points} pts
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
