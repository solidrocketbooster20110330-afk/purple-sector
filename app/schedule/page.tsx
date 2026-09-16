type Race = {
  raceName: string;
  Circuit: {
    circuitName: string;
  };
  date: string;
};

export default async function SchedulePage() {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/next.json",
    {
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();

  const race: Race = data.MRData.RaceTable.Races[0];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <a
        href="/"
        style={{
          display: "inline-block",
          color: "white",
          textDecoration: "none",
          background: "#1a2157",
          padding: "10px 18px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        ← Home
      </a>

      <h1>📅 Next Race Schedule</h1>

      <div
        style={{
          background: "#131942",
          border: "1px solid #2b347a",
          borderRadius: "20px",
          padding: "25px",
          marginTop: "20px",
        }}
      >
        <h2>🏁 {race.raceName}</h2>
        <p>📅 {race.date}</p>
        <p>📍 {race.Circuit.circuitName}</p>
      </div>
    </main>
  );
}
