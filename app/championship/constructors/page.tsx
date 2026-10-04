import Link from "next/link";
import BottomNav from "../../components/BottomNav";

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: {
    constructorId: string;
    name: string;
  };
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

      <section
        style={{
          ...cardStyle,
          maxHeight: "none",
          marginBottom: "20px",
        }}
      >
        <div style={{ color: "#a9adff", fontSize: "13px", marginBottom: "12px" }}>
          Team points by round
        </div>
        <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(125px,1.5fr) repeat(24,40px)",
              gap: "6px",
              minWidth: "1100px",
              alignItems: "center",
            }}
          >
            <div style={{ color: "#a9adff", fontSize: "11px", fontWeight: "bold" }}>
              TEAM
            </div>
            {Array.from({ length: 24 }, (_, index) => (
              <div
                key={index}
                style={{ color: "#a9adff", fontSize: "10px", textAlign: "center" }}
              >
                R{index + 1}
              </div>
            ))}
          </div>
          {constructors.map((constructor) => (
            <div
              key={constructor.Constructor.constructorId}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(125px,1.5fr) repeat(24,40px)",
                gap: "6px",
                minWidth: "1100px",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              <Link
                href={`/championship/constructors/${constructor.Constructor.constructorId}`}
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {constructor.Constructor.name}
              </Link>
              {Array.from({ length: 24 }, (_, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    color: "#dfe1ff",
                    fontSize: "11px",
                  }}
                >
                  —
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div style={cardStyle}>
        {constructors.length === 0 ? (
          <p style={{ color: "#a9adff" }}>Constructor 데이터가 없습니다.</p>
        ) : (
          constructors.map((constructor, index) => (
            <Link
              key={constructor.Constructor.constructorId}
              href={`/championship/constructors/${constructor.Constructor.constructorId}`}
              style={{
                display: "grid",
                gridTemplateColumns: "50px 1fr auto",
                gap: "12px",
                alignItems: "center",
                padding: "14px 0",
                borderBottom:
                  index === constructors.length - 1 ? "none" : "1px solid #2b347a",
                color: "white",
                textDecoration: "none",
              }}
            >
              <strong>{positionLabel(constructor.position)}</strong>

              <div style={{ fontWeight: "bold" }}>
                {constructor.Constructor.name}
              </div>

              <strong>{constructor.points} pts</strong>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
