import Link from "next/link";
import BottomNav from "../../components/BottomNav";

export default async function RoundPage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round } = await params;

  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/current/${round}.json`,
    {
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();

  const race =
    data.MRData.RaceTable.Races[0];

  if (!race) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
          color: "white",
          padding: "24px",
        }}
      >
        Race not found
      </main>
    );
  }

  const sessionCard = {
    background: "#131942",
    border: "1px solid #2b347a",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "14px",
  };

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
      <Link
        href="/schedule"
        style={{
          color: "#a9adff",
          textDecoration: "none",
        }}
      >
        ← Schedule
      </Link>

      <div
        style={{
          marginTop: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            color: "#a9adff",
            fontSize: "14px",
          }}
        >
          ROUND {round}
        </div>

        <h1
          style={{
            marginTop: "8px",
            marginBottom: "8px",
          }}
        >
          {race.raceName}
        </h1>

        <div
          style={{
            color: "#c7cbff",
          }}
        >
          📍 {race.Circuit.circuitName}
        </div>

        <div
          style={{
            color: "#c7cbff",
            marginTop: "6px",
          }}
        >
          📅 {race.date}
        </div>
      </div>

      <div style={sessionCard}>
        <h2>🏁 Race</h2>

        <div
          style={{
            color: "#a9adff",
            marginBottom: "12px",
          }}
        >
          Grand Prix Session
        </div>

        <Link
          href="/results"
          style={{
            color: "white",
            textDecoration: "none",
            background: "#1f2a6b",
            padding: "10px 14px",
            borderRadius: "10px",
            display: "inline-block",
          }}
        >
          View Results →
        </Link>
      </div>

      <div style={sessionCard}>
        <h2>⚡ Qualifying</h2>

        <div
          style={{
            color: "#a9adff",
            marginBottom: "12px",
          }}
        >
          Qualifying Session
        </div>

        <Link
          href="/results"
          style={{
            color: "white",
            textDecoration: "none",
            background: "#1f2a6b",
            padding: "10px 14px",
            borderRadius: "10px",
            display: "inline-block",
          }}
        >
          View Results →
        </Link>
      </div>

      <div style={sessionCard}>
        <h2>🛠 Practice</h2>

        <div
          style={{
            color: "#a9adff",
            marginBottom: "12px",
          }}
        >
          FP1 • FP2 • FP3
        </div>

        <Link
          href="/results"
          style={{
            color: "white",
            textDecoration: "none",
            background: "#1f2a6b",
            padding: "10px 14px",
            borderRadius: "10px",
            display: "inline-block",
          }}
        >
          View Results →
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}
