import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Governance Observatory",
  description:
    "Real-time AI governance intelligence platform tracking regulations, vendor guardrails, safety frameworks, and enforcement actions.",
  keywords: [
    "AI governance",
    "AI regulation",
    "EU AI Act",
    "NIST AI RMF",
    "AI safety",
    "vendor guardrails",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className={`${dmSans.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen bg-[#09090B] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
