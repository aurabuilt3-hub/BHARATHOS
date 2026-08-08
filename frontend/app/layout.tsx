import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import ThemeProvider from "../components/providers/ThemeProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BharatOS - AI-Powered Digital Twin Platform for Smart Governance",
  description: "Unified AI-powered command center integrating multi-agent reasoning, digital twin spatial maps, and real-time incident response.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22 fill=%22none%22><path d=%22M18,36 A34,34 0 0,1 82,36%22 stroke=%22%23FF9933%22 stroke-width=%225%22 stroke-linecap=%22round%22/><path d=%22M82,64 A34,34 0 0,1 18,64%22 stroke=%22%23128807%22 stroke-width=%225%22 stroke-linecap=%22round%22/><circle cx=%2250%22 cy=%2250%22 r=%2218%22 stroke=%22%231E90FF%22 stroke-width=%223%22/><circle cx=%2250%22 cy=%2250%22 r=%223.5%22 fill=%22%231E90FF%22/></svg>',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
