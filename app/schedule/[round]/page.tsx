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

  const race =
    data.MRData.RaceTable.Races[0];

  const formatSession = (
    session?: Session
  ) => {
    if (!session?.date) return "TBA";

    const date = new Date(
      `${session.date}T${
        session.time ?? "00:00:00Z"
      }`
    );

    return date.toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const sessions = [
    {
      title: "FP1",
      time: formatSession(
        race.FirstPractice
      ),
    },

    race.SecondPractice && {
      title: "FP2",
      time: formatSession(
        race.SecondPractice
      ),
    },

    race.ThirdPractice && {
      title: "FP3",
      time: formatSession(
        race.ThirdPractice
      ),
    },

    race.SprintQualifying && {
      title: "Sprint Qualifying",
      time: formatSession(
        race.SprintQualifying
      ),
    },

    race.Sprint && {
      title: "Sprint",
      time: formatSession(
        race.Sprint
      ),
    },

    {
      title: "Qualifying",
      time: formatSession(
        race.Qualifying
      ),
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
    background: "#131942",
    border: "1px solid #2b347a",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "14px",
  };

  const resultBtn = {
    display: "inline-block",
    marginTop: "12px",
    padding: "10px 14px",
    background: "#1f2a6b",
    borderRadius: "10px",
    textDecoration: "none",
    color: "white",
    fontWeight: "bold",
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

      {sessions.map((session: any) => (
        <div
          key={session.title}
          style={cardStyle}
        >
          <h2>{session.title}</h2>

          <div
            style={{
              color: "#a9adff",
            }}
          >
            {session.time}
          </div>

          <Link
            href="/results"
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
