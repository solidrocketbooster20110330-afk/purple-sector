import type { Metadata } from "next";
import TopNav from "./components/TopNav";

export const metadata: Metadata = {
  title: "Purple Sector",
  description: "Formula 1 dashboard, schedule, results and championship standings.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          background: "#050505",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <TopNav />
        {children}
      </body>
    </html>
  );
}
