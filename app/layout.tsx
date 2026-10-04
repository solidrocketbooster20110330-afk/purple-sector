import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PurpleSector",
  description: "F1 Dashboard",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body style={{ margin:0, background:"#05071f", color:"white", fontFamily:"Arial, sans-serif", overflowX:"hidden" }}>
        {children}
      </body>
    </html>
  );
}
