import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skycast — A clearer view of your day",
  description:
    "Your everyday weather companion. Explore live conditions, hourly trends, and seven-day forecasts for cities around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
