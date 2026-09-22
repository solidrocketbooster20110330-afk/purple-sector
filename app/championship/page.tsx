import Link from "next/link";
import BottomNav from "../components/BottomNav";

export default function ChampionshipPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#05071f 0%, #0c1037 100%)",
        color: "white",
        padding: "24px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >
      <h1>🏆 Championship</h1>

      <div
        style={{
          display: "grid",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <Link
          href="/championship/drivers"
          style={{
            background: "#131942",
            border: "1px solid #2b347a",
            borderRadius: "20px",
            padding: "20px",
            color: "white",
            textDecoration: "none",
          }}
        >
          <h2>👤 Drivers Championship</h2>
          <p>Driver standings</p>
        </Link>

        <Link
          href="/championship/constructors"
          style={{
            background: "#131942",
            border: "1px solid #2b347a",
            borderRadius: "20px",
            padding: "20px",
            color: "white",
            textDecoration: "none",
          }}
        >
          <h2>🏭 Constructors Championship</h2>
          <p>Constructor standings</p>
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}
