import type { Metadata } from 'next';
import { Inter } from "next/font/google"; // Changed font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Changed font setup
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // Use --font-sans convention
});

export const metadata: Metadata = {
  title: 'MiniHack Analyzer',
  description: 'Analyze your mini-hacks efficiently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure no whitespace between tags and use the new font variable
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
