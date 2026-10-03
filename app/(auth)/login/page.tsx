"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else router.push("/dashboard");
    setLoading(false);
  }
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to NOVA AI">
      <form onSubmit={submit} className="space-y-4">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-400"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-400"
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-2xl bg-violet-500 py-3 font-semibold disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        No account?{" "}
        <Link className="text-violet-300" href="/register">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050816] px-6">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <Link href="/" className="text-lg font-bold">
          NOVA AI
        </Link>
        <h1 className="mt-10 text-3xl font-bold">{title}</h1>
        <p className="mt-2 mb-7 text-slate-400">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
