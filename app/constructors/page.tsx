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

async function getConstructorStandings(): Promise<{
  constructors: ConstructorStanding[];
  unavailable: boolean;
}> {
  try {
    const res = await fetch(
      "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
      {
        next: { revalidate: 900 },
        headers: { Accept: "application/json" },
      }
    );

    if (!res.ok) {
      console.error("Constructor standings request failed:", res.status);
      return { constructors: [], unavailable: true };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error("Constructor standings returned non-JSON content:", contentType);
      return { constructors: [], unavailable: true };
    }

    const data = await res.json();
    const constructors: ConstructorStanding[] =
      data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

    return { constructors, unavailable: false };
  } catch (error) {
    console.error("Could not load constructor standings:", error);
    return { constructors: [], unavailable: true };
  }
}

export default async function ConstructorsPage() {
  const { constructors, unavailable } = await getConstructorStandings();

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
            key={team.Constructor?.name ?? team.position}
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
                : `P${team.position}`}{ " " }
              {team.Constructor?.name ?? "Unknown team"}
            </span>
            <strong>{team.points} pts</strong>
          </div>
        ))}

        {constructors.length === 0 && (
          <p style={{ color: "#a9adff" }}>
            {unavailable
              ? "컨스트럭터 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
              : "Constructor 데이터가 없습니다."}
          </p>
        )}
      </div>
    </main>
  );
}
