import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hareskov Badminton - Trænings & Turneringssystem",
  description: "Administrationssystem for Hareskov Badminton træninger og turneringer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
