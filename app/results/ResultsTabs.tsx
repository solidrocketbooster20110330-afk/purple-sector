"use client";

export default function ResultsTabs() {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      <button
        style={{
          flex: 1,
          padding: "12px",
          borderRadius: "12px",
          border: "none",
          background: "#7c3aed",
          color: "white",
          fontWeight: "bold",
        }}
      >
        🏁 Race
      </button>

      <button
        style={{
          flex: 1,
          padding: "12px",
          borderRadius: "12px",
          border: "none",
          background: "#131942",
          color: "white",
          fontWeight: "bold",
        }}
      >
        ⚡ Qualifying
      </button>

      <button
        style={{
          flex: 1,
          padding: "12px",
          borderRadius: "12px",
          border: "none",
          background: "#131942",
          color: "white",
          fontWeight: "bold",
        }}
      >
        🛠 Practice
      </button>
    </div>
  );
}
