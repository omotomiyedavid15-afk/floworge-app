import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter is a variable font — supports fractional weights 320, 330, 340, 450, 480, 540
// used as the closest public substitute for figmaSans
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"], // optical size axis for variable font
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowForge — Design-to-Engineering Handoff",
  description:
    "Import Figma designs natively as structured, inspectable canvases. Annotate, map user flows, and generate developer specifications — all in one workspace.",
  keywords: [
    "design handoff",
    "figma",
    "developer specs",
    "user flows",
    "annotations",
    "design system",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
