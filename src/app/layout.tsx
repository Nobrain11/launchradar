import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaunchRadar — Telegram-First Token Discovery",
  description:
    "Discover newly launched crypto tokens across Solana, Ethereum, Base, and BNB Chain. Only tokens with verified public Telegram groups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <DisclaimerBanner />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-card/50 py-6 text-center text-xs text-muted">
            <p>
              LaunchRadar is a discovery tool only. Newly launched tokens are highly
              speculative. Always conduct independent research. Not financial advice.
            </p>
            <p className="mt-1">
              Demo mode — sample data shown. Live API integrations require configuration.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
