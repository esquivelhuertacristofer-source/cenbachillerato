import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CEN — Campaña Educativa Nacional",
    template: "%s | CEN",
  },
  description:
    "Plataforma educativa digital alineada al MCCEMS y la Nueva Escuela Mexicana. Para escuelas y subsistemas del sistema educativo mexicano.",
  metadataBase: new URL("https://cen.edu.mx"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
