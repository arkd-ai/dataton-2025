import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Datatón 2025 Dashboard",
  description: "Análisis de Datos Anticorrupción",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-[hsl(var(--background))] text-white antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
