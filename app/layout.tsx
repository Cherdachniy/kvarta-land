import type { Metadata, Viewport } from "next";
import { Geologica, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Geologica({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "800", "900"],
  variable: "--font-geologica",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Кварта — свежая обжарка кофе в Минске",
  description:
    "Аня и Дима жарят кофе по четвергам на Короля, 9 и привозят по Минску в пятницу. Зерно у вас на 1–3 день после обжарки. Подписка — 54 BYN в месяц.",
};

export const viewport: Viewport = {
  themeColor: "#121413",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
