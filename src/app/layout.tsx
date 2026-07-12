// Root layout: shared top navigation with Monzo-inspired coral branding.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUserEmail } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PM Copilot",
  description: "AI-powered delivery copilot for banking programme managers",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const userEmail = await getCurrentUserEmail();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col" style={{ background: "var(--bg)" }}>
        <nav style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            {/* Brand */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{ background: "var(--coral)" }}
                >
                  PM
                </span>
                <span className="hidden font-semibold sm:block" style={{ color: "var(--navy)" }}>
                  PM Copilot
                </span>
              </Link>
              <Link
                href="/settings"
                className="text-sm transition-colors hover:opacity-100"
                style={{ color: "var(--text-secondary)" }}
              >
                Settings
              </Link>
              <Link
                href="/user-guide"
                className="text-sm transition-colors hover:opacity-100"
                style={{ color: "var(--text-secondary)" }}
              >
                User Guide
              </Link>
            </div>

            {/* User */}
            {userEmail && (
              <div className="flex items-center gap-3">
                <span
                  className="hidden truncate text-sm sm:block"
                  style={{ color: "var(--text-muted)", maxWidth: "180px" }}
                >
                  {userEmail}
                </span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "var(--coral)" }}
                  >
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </nav>

        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
