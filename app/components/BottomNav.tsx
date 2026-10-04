import Link from "next/link";

const navItems = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/schedule", icon: "📅", label: "Schedule" },
  { href: "/results", icon: "🏁", label: "Results" },
  { href: "/championship", icon: "🏆", label: "Championship" },
  { href: "/search", icon: "🔎", label: "Search" },
];

const navStyle = {
  color: "white",
  textDecoration: "none",
  textAlign: "center" as const,
};

export default function BottomNav() {
  return (
    <nav
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
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} style={navStyle}>
          <div>{item.icon}</div>
          <div style={{ fontSize: "12px" }}>{item.label}</div>
        </Link>
      ))}
    </nav>
  );
}
