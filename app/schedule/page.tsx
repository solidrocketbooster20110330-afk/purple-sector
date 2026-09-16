import Link from "next/link";
import BottomNav from "../components/BottomNav";

type Race = {
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    circuitName: string;
    Location: {
      country: string;
    };
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
          fontSize: "34px",
          marginBottom: "6px",
        }}
      >
        🏁 2026 Season
      </h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "24px",
        }}
      >
        Formula 1 Calendar
      </p>

      <div
        style={{
          display: "grid",
          gap: "14px",
        }}
      >
        {races.map((race) => (
          <Link
            key={race.round}
            href={`/schedule/${race.round}`}
            style={{
              textDecoration: "none",
              color: "white",
            }}
          >
            <div
              style={{
                background: "#131942",
                border:
                  "1px solid #2b347a",
                borderRadius: "18px",
                padding: "18px",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#a9adff",
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  ROUND {race.round}
                </div>

                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {race.raceName}
                </div>

                <div
                  style={{
                    color: "#c7cbff",
                    marginTop: "4px",
                  }}
                >
                  {
                    race.Circuit.Location
                      .country
                  }
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <div>
                  {new Date(
                    race.date
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </div>

                <div
                  style={{
                    color: "#a9adff",
                    marginTop: "6px",
                    fontSize: "20px",
                  }}
                >
                  →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
