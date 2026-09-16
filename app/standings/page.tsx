async function getDrivers() {
  const res = await fetch(
    "https://api.openf1.org/v1/drivers?session_key=latest",
    { cache: "no-store" }
  );

  return res.json();
}

export default async function StandingsPage() {
  const drivers = await getDrivers();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05071f",
        color: "white",
        padding: "24px",
        fontFamily: "Arial",
      }}
    >
      <h1>🏆 Driver List</h1>

      {drivers.slice(0, 20).map((driver: any) => (
        <div key={driver.driver_number}>
          #{driver.driver_number} {driver.full_name}
        </div>
      ))}
    </main>
  );
}
