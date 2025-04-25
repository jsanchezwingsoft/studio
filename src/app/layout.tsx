import type { Metadata } from 'next';
import { JetBrains_Mono } from "next/font/google";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
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
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${jetbrains.variable} font-mono antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}