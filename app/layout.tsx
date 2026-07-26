import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CGO Command Center",
  description: "Central de demandas operacionais do CGO",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
