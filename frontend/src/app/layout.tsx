import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APK Sentinel — Hybrid Static-Dynamic APK Security Console",
  description:
    "Automated mobile APK reverse engineering and risk scoring powered by apkman static code extraction and aparoid sandbox dynamic tracing.",
  keywords: [
    "apkman",
    "aparoid",
    "APK analysis",
    "malware detection",
    "Android security",
    "reverse engineering",
    "AI risk scoring",
  ],
};

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="text-on-surface font-body-md antialiased flex">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
