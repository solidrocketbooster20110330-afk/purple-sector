export default function RaceDetailPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#05071f 0%,#0c1037 100%)",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>🏎️ Race Weekend</h1>

      <div
        style={{
          background: "#131942",
          padding: "20px",
          borderRadius: "16px",
          marginTop: "20px",
        }}
      >
        <h2>FP1</h2>
        <button>View Results</button>
      </div>

      <div
        style={{
          background: "#131942",
          padding: "20px",
          borderRadius: "16px",
          marginTop: "20px",
        }}
      >
        <h2>FP2</h2>
        <button>View Results</button>
      </div>

      <div
        style={{
          background: "#131942",
          padding: "20px",
          borderRadius: "16px",
          marginTop: "20px",
        }}
      >
        <h2>FP3</h2>
        <button>View Results</button>
      </div>

      <div
        style={{
          background: "#131942",
          padding: "20px",
          borderRadius: "16px",
          marginTop: "20px",
        }}
      >
        <h2>Qualifying</h2>
        <button>View Results</button>
      </div>

      <div
        style={{
          background: "#131942",
          padding: "20px",
          borderRadius: "16px",
          marginTop: "20px",
        }}
      >
        <h2>Race</h2>
        <button>View Results</button>
      </div>
    </main>
  );
}
