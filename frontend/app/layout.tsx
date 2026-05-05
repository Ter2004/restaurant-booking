import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TableReserve — Reserve Your Perfect Table",
  description: "Discover curated restaurants and book instantly. Premium dining reservations, made simple.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-base text-[var(--text-primary)] antialiased font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
