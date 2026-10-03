"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) setError(error.message);
    else if (data.session) router.push("/dashboard");
    else
      setError("Akun dibuat. Cek email jika konfirmasi email Supabase aktif.");
    setLoading(false);
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#050816] px-6">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <Link href="/" className="text-lg font-bold">
          NOVA AI
        </Link>
        <h1 className="mt-10 text-3xl font-bold">Create account</h1>
        <p className="mt-2 mb-7 text-slate-400">Start building with NOVA AI.</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-400"
          />
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
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 6)"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-400"
          />
          {error && <p className="text-sm text-slate-300">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-violet-500 py-3 font-semibold"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link className="text-violet-300" href="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
