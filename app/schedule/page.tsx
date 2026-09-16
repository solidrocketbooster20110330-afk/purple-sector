import Link from "next/link";
import BottomNav from "../components/BottomNav";

type Race = {
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    circuitName: string;
  };
};

export default async function SchedulePage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current.json",
    {
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();

  const races: Race[] =
    data.MRData.RaceTable.Races;

  const nextRace = races.find(
    (race) =>
      new Date(race.date) >= new Date()
  ) || races[races.length - 1];

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
      <h1
        style={{
          fontSize: "36px",
          marginBottom: "20px",
        }}
      >
        📅 Schedule
      </h1>

      <Link
        href={`/schedule/${nextRace.round}`}
        style={{
          display: "block",
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "24px",
          textDecoration: "none",
          color: "white",
        }}
      >
        <div
          style={{
            color: "#a9adff",
            marginBottom: "8px",
            fontSize: "13px",
          }}
        >
          NEXT RACE
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          {nextRace.raceName}
        </div>

        <div
          style={{
            marginTop: "10px",
            color: "#c7cbff",
          }}
        >
          {nextRace.date} →
        </div>
      </Link>

      <h2
        style={{
          marginBottom: "15px",
          color: "#a9adff",
        }}
      >
        2026 SEASON
      </h2>

      <div>
        {races.map((race) => (
          <Link
            key={race.round}
            href={`/schedule/${race.round}`}
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              padding: "18px",
              marginBottom: "12px",
              background: "#131942",
              border:
                "1px solid #2b347a",
              borderRadius: "14px",
              textDecoration: "none",
              color: "white",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: "bold",
                }}
              >
                {race.raceName}
              </div>

              <div
                style={{
                  color: "#a9adff",
                  fontSize: "14px",
                }}
              >
                Round {race.round}
              </div>
            </div>

            <div>→</div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
