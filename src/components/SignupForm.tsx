// Email/password sign-up form — Monzo-style inputs and coral button.
// Confirmation is required (project setting), so this shows a "check your email"
// message rather than logging in immediately.

"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

const inputClass =
  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2";
const inputStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--navy)",
};

/** Sign-up form: email + password, sends a confirmation link. */
export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Check your email for a confirmation link to finish creating your account.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {error && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--coral)" }}
      >
        {isSubmitting ? "Signing up…" : "Sign up"}
      </button>
    </form>
  );
}
