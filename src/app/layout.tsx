import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
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
    <html lang="es" className={`${epilogue.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
