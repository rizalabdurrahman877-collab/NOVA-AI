import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Code2,
  Globe2,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
const features = [
  {
    icon: Code2,
    title: "Coding",
    text: "Build, debug, refactor, and understand code with a developer-focused workspace.",
  },
  {
    icon: Brain,
    title: "Reasoning",
    text: "Break complex problems into clear, useful steps and decisions.",
  },
  {
    icon: MessageSquare,
    title: "Writing",
    text: "Draft, rewrite, summarize, and polish content faster.",
  },
  {
    icon: Globe2,
    title: "General AI",
    text: "A flexible assistant for everyday questions and information.",
  },
];
export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden nova-grid">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(141,124,255,.2),transparent_35%)]" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-violet-500">
            <Sparkles size={18} />
          </span>
          NOVA AI
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Get Started
          </Link>
        </div>
      </nav>
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-200">
          <Zap size={15} /> AI workspace for builders
        </div>
        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          Build faster with <span className="gradient-text">NOVA AI</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          General AI, coding, reasoning, writing, and developer assistance in
          one modern workspace.
        </p>
        <div className="mt-9 flex justify-center gap-3">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-2xl bg-violet-500 px-6 py-3 font-semibold hover:bg-violet-400"
          >
            Start with NOVA <ArrowRight size={18} />
          </Link>
          <Link
            href="#features"
            className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-slate-300 hover:bg-white/5"
          >
            Explore
          </Link>
        </div>
      </section>
      <section
        id="features"
        className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-4"
      >
        {features.map((f) => (
          <div key={f.title} className="glass rounded-3xl p-6">
            <div className="mb-5 grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
              <f.icon size={21} />
            </div>
            <h2 className="font-bold">{f.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
