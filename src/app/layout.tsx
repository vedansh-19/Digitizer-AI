import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
