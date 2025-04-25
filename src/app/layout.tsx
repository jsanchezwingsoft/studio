import type {Metadata} from 'next';
import { JetBrains_Mono } from "next/font/google" // Updated font import
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

// Updated font initialization
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono", // Use mono variable
  weight: ["400", "700"], // Include weights if needed
})


export const metadata: Metadata = {
  title: 'MiniHack Analyzer',
  description: 'Analyze your mini-hacks efficiently.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${jetbrains.variable} font-mono antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
