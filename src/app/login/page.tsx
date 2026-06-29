// Login page.

import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

/** Sign-in page. */
export default function LoginPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-sm flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Sign in</h1>
        <LoginForm />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-black underline dark:text-zinc-50">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
