import Link from "next/link";
import BottomNav from "../components/BottomNav";

type Race = {
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: { circuitName: string };
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
  color: "white",
  padding: "24px",
  paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box" as const,
};

const cardStyle = {
  background: "#111111",
  border: "1px solid #3a171b",
  borderRadius: "20px",
};

function getRaceDateTime(race: Race) {
  const time = race.time ?? "23:59:59Z";
  const normalizedTime = /(?:Z|[+-]\d{2}:\d{2})$/.test(time)
    ? time
    : `${time}Z`;

  return new Date(`${race.date}T${normalizedTime}`);
}

function formatRaceDateKst(race: Race) {
  const time = race.time
    ? /(?:Z|[+-]\d{2}:\d{2})$/.test(race.time)
      ? race.time
      : `${race.time}Z`
    : "00:00:00Z";
  const dateTime = new Date(`${race.date}T${time}`);
  const dateLabel = dateTime.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  if (!race.time) return dateLabel;

  const timeLabel = dateTime.toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateLabel} · ${timeLabel} KST`;
}

export default async function SchedulePage() {
  let races: Race[] = [];

  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      races = data?.MRData?.RaceTable?.Races ?? [];
    }
  } catch (error) {
    console.error("Schedule page data error:", error);
  }
  const now = Date.now();

  const nextRace =
    races.find((race) => getRaceDateTime(race).getTime() >= now) ??
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
      <h1 style={{ fontSize: "clamp(28px, 7vw, 36px)", margin: "0 0 20px" }}>
        📅 Schedule
      </h1>

      <Link
        href={`/schedule/${nextRace.round}`}
        style={{
          ...cardStyle,
          display: "block",
          padding: "clamp(18px, 5vw, 24px)",
          marginBottom: "24px",
          textDecoration: "none",
          color: "white",
          overflowWrap: "anywhere",
        }}
      >
        <div style={{ color: "#ef233c", marginBottom: "8px", fontSize: "13px", fontWeight: "bold" }}>
          NEXT RACE
        </div>
        <div style={{ fontSize: "clamp(22px, 6vw, 28px)", fontWeight: "bold", lineHeight: 1.2 }}>
          {nextRace.raceName}
        </div>
        <div style={{ marginTop: "10px", color: "#c6b8ba", fontSize: "14px" }}>
          {formatRaceDateKst(nextRace)}
        </div>
      </Link>

      <h2 style={{ marginBottom: "15px", color: "#ef233c", fontSize: "18px" }}>
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
            gap: "12px",
            padding: "16px",
            marginBottom: "12px",
            ...cardStyle,
            borderRadius: "14px",
            textDecoration: "none",
            color: "white",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
            <div style={{ fontWeight: "bold", lineHeight: 1.3 }}>{race.raceName}</div>
            <div style={{ color: "#b66b72", fontSize: "13px", marginTop: "5px" }}>
              Round {race.round}
            </div>
            <div style={{ color: "#c6b8ba", fontSize: "12px", marginTop: "5px" }}>
              {formatRaceDateKst(race)}
            </div>
          </div>
          <div aria-hidden="true" style={{ color: "#ef233c", fontWeight: "bold", flexShrink: 0 }}>→</div>
        </Link>
      ))}

      <BottomNav />
    </main>
  );
}
