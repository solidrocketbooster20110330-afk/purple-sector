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

      <div style={{ marginBottom: "20px" }}>
        <div style={{ color: "#a9adff", fontSize: "13px", marginBottom: "12px" }}>
          Championship Progress
        </div>
        <div
          style={{
            ...cardStyle,
            maxHeight: "none",
            overflow: "hidden",
          }}
        >
          <div style={{ color: "#a9adff", fontSize: "12px", marginBottom: "8px" }}>
            Cumulative constructor points by round
          </div>
          <div
            style={{
              height: "260px",
              overflowX: "auto",
            }}
          >
            <svg
              viewBox="0 0 720 260"
              width="100%"
              height="260"
              role="img"
              aria-label="Constructor championship points progress graph"
              style={{ display: "block", minWidth: "520px" }}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const y = 220 - 200 * fraction;
                return (
                  <g key={fraction}>
                    <line
                      x1="42"
                      x2="702"
                      y1={y}
                      y2={y}
                      stroke="#2b347a"
                      strokeWidth="1"
                    />
                    <text
                      x="34"
                      y={y + 4}
                      textAnchor="end"
                      fill="#a9adff"
                      fontSize="10"
                    >
                      0
                    </text>
                  </g>
                );
              })}
              <text x="42" y="250" fill="#a9adff" fontSize="10">R1</text>
              <text x="702" y="250" textAnchor="end" fill="#a9adff" fontSize="10">R24</text>
            </svg>
          </div>
        </div>
      </div>

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
