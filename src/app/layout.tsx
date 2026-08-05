import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["400", "500", "600", "700", "800"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Digitizer AI | Messy Notes & Prescriptions",
  description: "Transform handwritten notes and prescriptions into structured text using Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${spaceGrotesk.variable} ${syne.variable}`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
