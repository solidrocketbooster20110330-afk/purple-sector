export const metadata = {
  title: "PurpleSector",
  description: "F1 Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, background: "#2b2f33", color: "#f2f2f2" }}>{children}</body>
    </html>
  );
}
