import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Code2, Brain, PenLine, Sparkles } from "lucide-react";
export default async function Dashboard() {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await s
    .from("profiles")
    .select("name,plan")
    .eq("id", user.id)
    .maybeSingle();
  const cards = [
    {
      title: "Coding",
      text: "Build and debug applications.",
      icon: Code2,
      mode: "coding",
    },
    {
      title: "Reasoning",
      text: "Work through complex problems.",
      icon: Brain,
      mode: "reasoning",
    },
    {
      title: "Writing",
      text: "Draft and improve content.",
      icon: PenLine,
      mode: "writing",
    },
  ];
  return (
    <main className="min-h-screen bg-[#050816] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-500">
              <Sparkles size={18} />
            </span>
            <span className="text-xl font-bold">NOVA AI</span>
          </div>
          <Link
            href="/chat/new"
            className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold"
          >
            New chat
          </Link>
        </header>
        <section className="mt-16">
          <p className="text-sm text-violet-300">{p?.plan || "free"} plan</p>
          <h1 className="mt-2 text-4xl font-bold">
            Welcome{p?.name ? `, ${p.name}` : ""}.
          </h1>
          <p className="mt-3 text-slate-400">
            Choose a workspace and start building.
          </p>
        </section>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Link
              href={`/chat/new?mode=${c.mode}`}
              key={c.title}
              className="glass rounded-3xl p-6 transition hover:-translate-y-1"
            >
              <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
                <c.icon size={21} />
              </div>
              <h2 className="mt-6 font-bold">{c.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{c.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-violet-300">
                Open <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
