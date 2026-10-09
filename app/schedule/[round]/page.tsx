import Link from "next/link";
import BottomNav from "../../components/BottomNav";

type Session = {
  date?: string;
  time?: string;
};

type Race = {
  raceName: string;
  date: string;
  time?: string;
  Circuit: { circuitName: string };
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  SprintQualifying?: Session;
  Sprint?: Session;
  Qualifying?: Session;
};

const TIME_ZONE = "Asia/Seoul";

function toDateTime(session: Session): Date | null {
  if (!session.date) return null;

  const time = session.time
    ? /(?:Z|[+-]\d{2}:\d{2})$/.test(session.time)
      ? session.time
      : `${session.time}Z`
    : "00:00:00Z";

  const dateTime = new Date(`${session.date}T${time}`);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
}

function formatSessionKst(session?: Session): string {
  if (!session?.date) return "일정 미정";

  const dateTime = toDateTime(session);
  if (!dateTime) return "일정 미정";

  const dateLabel = dateTime.toLocaleDateString("ko-KR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  if (!session.time) return dateLabel;

  const timeLabel = dateTime.toLocaleTimeString("ko-KR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateLabel} · ${timeLabel} KST`;
}

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
  const race: Race | undefined = data?.MRData?.RaceTable?.Races?.[0];

  const cardStyle = {
    background: "rgba(17, 17, 17, 0.9)",
    border: "1px solid #3a171b",
    borderRadius: "16px",
    padding: "clamp(16px, 4vw, 20px)",
    marginBottom: "14px",
    boxSizing: "border-box" as const,
  };

  const resultBtn = {
    display: "inline-block",
    marginTop: "12px",
    padding: "10px 14px",
    background: "#171717",
    border: "1px solid #5a1d24",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#ef233c",
    fontWeight: "bold",
    minHeight: "40px",
    boxSizing: "border-box" as const,
  };

  if (!race) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
          color: "white",
          padding: "24px",
          paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Link href="/schedule" style={{ color: "#ef233c", textDecoration: "none" }}>
          ← Schedule
        </Link>
        <h1>일정을 불러오지 못했습니다.</h1>
        <BottomNav />
      </main>
    );
  }

  const sessions = [
    { title: "FP1", session: race.FirstPractice },
    race.SecondPractice && { title: "FP2", session: race.SecondPractice },
    race.ThirdPractice && { title: "FP3", session: race.ThirdPractice },
    race.SprintQualifying && {
      title: "Sprint Qualifying",
      session: race.SprintQualifying,
    },
    race.Sprint && { title: "Sprint", session: race.Sprint },
    { title: "Qualifying", session: race.Qualifying },
    {
      title: "Race",
      session: { date: race.date, time: race.time },
    },
  ].filter((session): session is { title: string; session: Session | undefined } => Boolean(session));

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
        color: "white",
        padding: "clamp(16px, 5vw, 24px)",
        paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <Link
        href="/schedule"
        style={{
          color: "#ef233c",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        ← Schedule
      </Link>

      <div style={{ marginTop: "20px", marginBottom: "30px" }}>
        <div
          style={{
            color: "#ef233c",
            fontSize: "14px",
            fontWeight: "bold",
            letterSpacing: "0.05em",
          }}
        >
          ROUND {round}
        </div>

        <h1
          style={{
            marginTop: "8px",
            marginBottom: "8px",
            fontSize: "clamp(25px, 6vw, 34px)",
            lineHeight: 1.2,
            overflowWrap: "anywhere",
          }}
        >
          {race.raceName}
        </h1>

        <div style={{ color: "#bdb6b8", overflowWrap: "anywhere" }}>
          📍 {race.Circuit?.circuitName ?? "Circuit TBA"}
        </div>

        <div style={{ color: "#c6b8ba", marginTop: "8px", fontSize: "14px" }}>
          🗓️ 레이스 시작: {formatSessionKst({ date: race.date, time: race.time })}
        </div>
        <div style={{ color: "#a78bfa", marginTop: "5px", fontSize: "12px" }}>
          모든 시간은 한국 표준시(KST, UTC+9) 기준
        </div>
      </div>

      {sessions.map(({ title, session }) => (
        <div key={title} style={cardStyle}>
          <h2 style={{ marginTop: 0, marginBottom: "10px", fontSize: "18px" }}>
            {title}
          </h2>

          <div style={{ color: "#d5b8bd", fontSize: "14px", lineHeight: 1.5 }}>
            {formatSessionKst(session)}
          </div>

          <Link
            href={
              title === "FP1"
                ? `/results/practice/${round}`
                : title === "FP2" || title === "Sprint Qualifying"
                  ? `/results/practice2/${round}`
                  : title === "FP3" || title === "Sprint"
                    ? `/results/practice3/${round}`
                    : title === "Qualifying"
                      ? `/results/qualifying?round=${round}`
                      : `/results?round=${round}`
            }
            style={resultBtn}
          >
            View Results →
          </Link>
        </div>
      ))}

      <BottomNav />
    </main>
  );
}
