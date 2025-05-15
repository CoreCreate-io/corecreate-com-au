import type { Metadata } from "next";
import { Manrope, Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
    display: "swap",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoreCreate - Creative Media Agency",
  description: "CoreCreate is a creative media agency specializing in photography, videography and digital content creation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${manrope.variable} ${sora.variable} ${geistMono.variable} antialiased`}>
        {children}
        <SpeedInsights />
        <Analytics/>
      </body>
    </html>
  );
}
