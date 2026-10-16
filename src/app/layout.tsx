import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Newsroom 360 | Sua redação, conectada", template: "%s | Newsroom 360" },
  description: "Planejamento, apuração e produção editorial em um único lugar.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
