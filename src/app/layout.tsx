import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenClawbot Replica | Agentic Workspace",
  description:
    "An autonomous web-based AI agent inspired by OpenClawbot with planning, tooling, and rich reasoning output.",
  metadataBase: new URL("https://agentic-ebddcd50.vercel.app"),
  openGraph: {
    title: "OpenClawbot Replica",
    description:
      "Plan tasks, orchestrate tools, and collaborate with a web-native AI agent.",
    url: "https://agentic-ebddcd50.vercel.app",
    siteName: "OpenClawbot Replica",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClawbot Replica",
    description:
      "Agentic workspace for orchestrating multi-step reasoning and tooling.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
