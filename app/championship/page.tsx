import BottomNav from "../components/BottomNav";

type DriverStanding = {
  position: string;
  points: string;
  Driver: {
    givenName: string;
    familyName: string;
    permanentNumber?: string;
  };
  Constructors: {
    name: string;
  }[];
};

type ConstructorStanding = {
  position: string;
  points: string;
  Constructor: {
    name: string;
  };
};

export default async function ChampionshipPage() {
  const [driversRes, constructorsRes] =
    await Promise.all([
      fetch(
        "https://api.jolpi.ca/ergast/f1/current/driverstandings.json",
        {
          next: { revalidate: 3600 },
        }
      ),
      fetch(
        "https://api.jolpi.ca/ergast/f1/current/constructorstandings.json",
        {
          next: { revalidate: 3600 },
        }
      ),
    ]);

  const driversData =
    await driversRes.json();

  const constructorsData =
    await constructorsRes.json();

  const drivers: DriverStanding[] =
    driversData.MRData.StandingsTable
      .StandingsLists[0]
      .DriverStandings;

  const constructors: ConstructorStanding[] =
    constructorsData.MRData.StandingsTable
      .StandingsLists[0]
      .ConstructorStandings;

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
      <h1>🏆 Championship</h1>

      <h2
        style={{
          marginTop: "30px",
          marginBottom: "16px",
        }}
      >
        👤 Drivers Championship
      </h2>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
          maxHeight: "500px",
          overflowY: "auto",
        }}
      >
        {drivers.map((driver) => (
          <div
            key={driver.position}
            style={{
              padding: "12px 0",
              borderBottom:
                "1px solid #2b347a",
            }}
          >
            <strong>
              {driver.position === "1"
                ? "🥇"
                : driver.position === "2"
                ? "🥈"
                : driver.position === "3"
                ? "🥉"
                : `P${driver.position}`}
            </strong>

            <div>
              #
              {driver.Driver
                .permanentNumber ?? "-"}{" "}
              {driver.Driver.givenName}{" "}
              {driver.Driver.familyName}
            </div>

            <div
              style={{
                color: "#a9adff",
              }}
            >
              {driver.Constructors[0]?.name}
            </div>

            <div>
              {driver.points} pts
            </div>
          </div>
        ))}
      </div>

      <h2
        style={{
          marginTop: "30px",
          marginBottom: "16px",
        }}
      >
        🏭 Constructors Championship
      </h2>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "20px",
          maxHeight: "500px",
          overflowY: "auto",
        }}
      >
        {constructors.map((team) => (
          <div
            key={team.position}
            style={{
              padding: "12px 0",
              borderBottom:
                "1px solid #2b347a",
            }}
          >
            <strong>
              {team.position === "1"
                ? "🥇"
                : team.position === "2"
                ? "🥈"
                : team.position === "3"
                ? "🥉"
                : `P${team.position}`}
            </strong>

            <div>
              {team.Constructor.name}
            </div>

            <div
              style={{
                color: "#a9adff",
              }}
            >
              {team.points} pts
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
