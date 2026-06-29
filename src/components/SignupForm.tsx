// Email/password sign-up form. Confirmation is required (project setting),
// so this shows a "check your email" message rather than logging in
// immediately.

"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Check your email for a confirmation link to finish creating your account.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-black dark:text-zinc-50">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-md border border-black/10 bg-white p-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-black dark:text-zinc-50">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-md border border-black/10 bg-white p-2 text-sm text-black dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {isSubmitting ? "Signing up..." : "Sign up"}
      </button>
    </form>
  );
}
