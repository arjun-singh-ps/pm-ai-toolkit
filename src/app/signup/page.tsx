// Signup page — Monzo-inspired card layout.

import Link from "next/link";
import { SignupForm } from "@/components/SignupForm";

/** Sign-up page. */
export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
      <main className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white"
            style={{ background: "var(--coral)" }}
          >
            PM
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
            Create your account
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Get started with PM Copilot
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--surface)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border)",
          }}
        >
          <SignupForm />
        </div>

        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:opacity-80" style={{ color: "var(--coral)" }}>
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
