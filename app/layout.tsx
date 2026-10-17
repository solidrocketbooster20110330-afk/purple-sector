import type { Metadata, Viewport } from "next";
import TopNav from "./components/TopNav";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import "./desktop.css";

export const metadata: Metadata = {
  title: "Purple Sector",
  applicationName: "Purple Sector",
  description: "Formula 1 dashboard, schedule, results and championship standings.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Purple Sector",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
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
        <ServiceWorkerRegister />
        <TopNav />
        {children}
      </body>
    </html>
  );
}
