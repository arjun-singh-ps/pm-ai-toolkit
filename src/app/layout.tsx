import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PM AI Toolkit",
  description: "AI-assisted delivery toolkit for banking programme managers",
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
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex justify-center border-b border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
          <div className="flex w-full max-w-3xl items-center gap-6 px-6 py-3">
            <Link
              href="/"
              className="text-sm font-medium text-black dark:text-zinc-50"
            >
              Templates
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Project Context
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
