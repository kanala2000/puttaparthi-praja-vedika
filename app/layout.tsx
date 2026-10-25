import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "పుట్టపర్తి ప్రజా వేదిక",
  description: "పుట్టపర్తి నియోజకవర్గ ప్రజల సమస్యలను నమోదు చేసి స్థితిని తెలుసుకునే ప్రజా వేదిక.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="te">
      <body>{children}</body>
    </html>
  );
}
