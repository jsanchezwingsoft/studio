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
    <html lang="en" suppressHydrationWarning className="dark h-full">
      {/* Apply h-full to html and body to ensure they take full viewport height */}
      <body className={`${jetbrains.variable} font-mono antialiased flex flex-col min-h-screen`}>
        {/* Use flex flex-col and min-h-screen to allow content to grow */}
        <div className="flex-grow flex flex-col"> {/* Add a flex-grow container */}
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
