import Link from "next/link";
import BottomNav from "../components/BottomNav";

type Race = {
  round: string;
  raceName: string;
  date: string;
  Circuit: { circuitName: string };
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "100px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "#111111",
  border: "1px solid #3a171b",
  borderRadius: "20px",
};

export default async function SchedulePage() {
  const res = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
    next: { revalidate: 3600 },
  });
  const data = await res.json();
  const races: Race[] = data?.MRData?.RaceTable?.Races ?? [];

  const nextRace =
    races.find((race) => new Date(race.date) >= new Date()) ??
    races[races.length - 1];

  if (!nextRace) {
    return (
      <main style={pageStyle}>
        <h1>📅 Schedule</h1>
        <p>No schedule data available.</p>
        <BottomNav />
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>
        📅 Schedule
      </h1>

      <Link
        href={`/schedule/${nextRace.round}`}
        style={{
          ...cardStyle,
          display: "block",
          padding: "24px",
          marginBottom: "24px",
          textDecoration: "none",
          color: "white",
        }}
      >
        <div style={{ color: "#ef233c", marginBottom: "8px", fontSize: "13px", fontWeight: "bold" }}>
          NEXT RACE
        </div>
        <div style={{ fontSize: "28px", fontWeight: "bold" }}>
          {nextRace.raceName}
        </div>
        <div style={{ marginTop: "10px", color: "#c6b8ba" }}>
          {nextRace.date} →
        </div>
      </Link>

      <h2 style={{ marginBottom: "15px", color: "#ef233c" }}>
        2026 SEASON
      </h2>

      {races.map((race) => (
        <Link
          key={race.round}
          href={`/schedule/${race.round}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px",
            marginBottom: "12px",
            ...cardStyle,
            borderRadius: "14px",
            textDecoration: "none",
            color: "white",
          }}
        >
          <div>
            <div style={{ fontWeight: "bold" }}>{race.raceName}</div>
            <div style={{ color: "#b66b72", fontSize: "14px" }}>
              Round {race.round}
            </div>
          </div>
          <div style={{ color: "#ef233c", fontWeight: "bold" }}>→</div>
        </Link>
      ))}

      <BottomNav />
    </main>
  );
}
