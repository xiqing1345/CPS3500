import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";

// retain existing fonts for fallback/accessibility
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// new futuristic font for headings and overall vibe
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "Personal portfolio with AI resume helper",
};

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FloatingAssistant from "../../components/FloatingAssistant";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable}`}>
        <Navbar />
        <main className="main-content">
          <div className="container">{children}</div>
        </main>
        <FloatingAssistant />
        <Footer />
      </body>
    </html>
  );
}
