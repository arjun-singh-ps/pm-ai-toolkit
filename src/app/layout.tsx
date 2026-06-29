// Root layout: wraps every page with the shared top navigation.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUserEmail } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";
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

/** Shared shell rendered around every route: fonts, global CSS, and the top nav. */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userEmail = await getCurrentUserEmail();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex justify-center border-b border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
          <div className="flex w-full max-w-3xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-black dark:text-zinc-50"
              >
                Programmes
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Settings
              </Link>
            </div>

            {userEmail && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{userEmail}</span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
