import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Literata, Manrope } from "next/font/google";
import "./globals.css";

const serif = Literata({
  subsets: ["latin", "cyrillic"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "кварта — свежая обжарка кофе в Минске",
  description:
    "Обжариваем зерно партиями по 5 кг по четвергам, по пятницам развозим по Минску. Кофе приезжает на 1–3 день после обжарки. Подписка — 54 BYN в месяц.",
};

export const viewport: Viewport = {
  themeColor: "#F5F0E7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
