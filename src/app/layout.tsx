import type { Metadata } from 'next';
import { JetBrains_Mono } from "next/font/google";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { VideoBackground } from '@/components/background/video-background'; // Import the new component

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
      <body className={`${jetbrains.variable} font-mono antialiased relative`}> {/* Add relative positioning */}
        <VideoBackground /> {/* Add the video background */}
        <main className="relative z-10 flex flex-col min-h-screen"> {/* Ensure content is above background and takes full height */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
