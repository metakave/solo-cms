import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoloCRM — Lightweight AI CRM for Solopreneurs & Odoo Consultants",
  description:
    "Lightweight, ultra-responsive CRM tailored for Solopreneurs, Odoo Consultants, and Corporate Trainers. Features DeepSeek AI intelligence, 1-click WhatsApp wa.me messaging, Zoho Calendar sync, and Hermes Agent integration.",
  icons: {
    icon: [
      { url: "/crm.png", href: "/crm.png" },
    ],
    shortcut: "/crm.png",
    apple: "/crm.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
