import Link from "next/link";

export default function BottomNav() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "70px",
        background: "#0a0d25",
        borderTop: "1px solid #2b347a",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <Link
        href="/"
        style={{
          color: "white",
          textDecoration: "none",
          textAlign: "center",
        }}
      >
        <div>🏠</div>
        <div style={{ fontSize: "12px" }}>Home</div>
      </Link>

      <Link
        href="/schedule"
        style={{
          color: "white",
          textDecoration: "none",
          textAlign: "center",
        }}
      >
        <div>📅</div>
        <div style={{ fontSize: "12px" }}>Schedule</div>
      </Link>

      <Link
        href="/results"
        style={{
          color: "white",
          textDecoration: "none",
          textAlign: "center",
        }}
      >
        <div>🏁</div>
        <div style={{ fontSize: "12px" }}>Results</div>
      </Link>

      <Link
        href="/championship"
        style={{
          color: "white",
          textDecoration: "none",
          textAlign: "center",
        }}
      >
        <div>🏆</div>
        <div style={{ fontSize: "12px" }}>Championship</div>
      </Link>
    </div>
  );
}
