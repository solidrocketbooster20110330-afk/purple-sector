type PracticeSession = {
  title: string;
  description: string;
};

export default async function PracticePage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round } = await params;

  const sessions: PracticeSession[] = [
    {
      title: "🛠 FP1",
      description: "Free Practice 1",
    },
    {
      title: "🛠 FP2",
      description: "Free Practice 2",
    },
    {
      title: "🛠 FP3",
      description: "Free Practice 3",
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
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1>🛠 Practice Results</h1>

      <p
        style={{
          color: "#a9adff",
          marginBottom: "20px",
        }}
      >
        Round {round}
      </p>

      {sessions.map((session) => (
        <div
          key={session.title}
          style={{
            background: "#131942",
            border: "1px solid #2b347a",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <h2>{session.title}</h2>

          <p
            style={{
              color: "#a9adff",
            }}
          >
            {session.description}
          </p>

          <div
            style={{
              marginTop: "12px",
              color: "#c7cbff",
            }}
          >
            OpenF1 연동 예정
          </div>
        </div>
      ))}
    </main>
  );
}
