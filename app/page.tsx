export default function HomePage() {
  const cards = [
    {
      title: "🏁 Next Race",
      value: "Loading...",
    },
    {
      title: "👨‍🏎️ Driver Standings",
      value: "Loading...",
    },
    {
      title: "🏆 Constructor",
      value: "Loading...",
    },
    {
      title: "📰 Latest News",
      value: "Loading...",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "24px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "56px",
          fontWeight: "bold",
        }}
      >
        🟣 PurpleSector
      </h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "40px",
        }}
      >
        Ultimate Formula 1 Dashboard
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "#131942",
              border: "1px solid #2b347a",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            <h2>{card.title}</h2>
            <p>{card.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
