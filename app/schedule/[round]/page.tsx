import Link from "next/link";
import BottomNav from "../../components/BottomNav";

type Session = {
  date?: string;
  time?: string;
};

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

  const race = data.MRData.RaceTable.Races[0];

  const formatSession = (session?: Session) => {
    if (!session?.date) return "TBA";

    const date = new Date(
      `${session.date}T${session.time ?? "00:00:00Z"}`
    );

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sessions = [
    {
      title: "FP1",
      time: formatSession(race.FirstPractice),
    },
    race.SecondPractice && {
      title: "FP2",
      time: formatSession(race.SecondPractice),
    },
    race.ThirdPractice && {
      title: "FP3",
      time: formatSession(race.ThirdPractice),
    },
    race.SprintQualifying && {
      title: "Sprint Qualifying",
      time: formatSession(race.SprintQualifying),
    },
    race.Sprint && {
      title: "Sprint",
      time: formatSession(race.Sprint),
    },
    {
      title: "Qualifying",
      time: formatSession(race.Qualifying),
    },
    {
      title: "Race",
      time: formatSession({
        date: race.date,
        time: race.time,
      }),
    },
  ].filter(Boolean);

  const cardStyle = {
    background: "#111111",
    border: "1px solid #3a171b",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "14px",
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
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050505 0%, #08070d 28%, #120c1d 58%, #1b1230 100%)",
        color: "white",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
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

        <h1 style={{ marginTop: "8px", marginBottom: "8px" }}>
          {race.raceName}
        </h1>

        <div style={{ color: "#bdb6b8" }}>
          📍 {race.Circuit.circuitName}
        </div>

        <div style={{ color: "#bdb6b8", marginTop: "6px" }}>
          📅 {race.date}
        </div>
      </div>

      {sessions.map((session: any) => (
        <div key={session.title} style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>{session.title}</h2>

          <div style={{ color: "#b66b72" }}>{session.time}</div>

          <Link
            href={
              session.title === "FP1"
                ? `/results/practice/${round}`
                : session.title === "FP2" || session.title === "Sprint Qualifying"
                  ? `/results/practice2/${round}`
                  : session.title === "FP3" || session.title === "Sprint"
                    ? `/results/practice3/${round}`
                    : session.title === "Qualifying"
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
