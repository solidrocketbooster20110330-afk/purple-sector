import Link from "next/link";

const navItems = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/schedule", icon: "📅", label: "Schedule" },
  { href: "/results", icon: "🏁", label: "Results" },
  { href: "/championship", icon: "🏆", label: "Championship" },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(70px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxSizing: "border-box",
        background: "rgba(8, 8, 8, 0.96)",
        borderTop: "1px solid #3a1217",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 999,
        backdropFilter: "blur(12px)",
      }}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            color: "white",
            textDecoration: "none",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            flex: 1,
            minWidth: 0,
            minHeight: "44px",
            padding: "6px 2px",
            fontSize: "20px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span aria-hidden="true">{item.icon}</span>
          <span style={{ fontSize: "11px", lineHeight: 1.2, whiteSpace: "nowrap" }}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
