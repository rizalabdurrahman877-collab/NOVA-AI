"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Plus,
  Globe2,
  Code2,
  Brain,
  PenLine,
  LogOut,
} from "lucide-react";

import ChatHistory from "./ChatHistory";

type SidebarProps = {
  email?: string | null;
  onLogout?: () => void;
};

const modes = [
  {
    name: "General",
    href: "/chat/new?mode=general",
    icon: Globe2,
  },
  {
    name: "Coding",
    href: "/chat/new?mode=coding",
    icon: Code2,
  },
  {
    name: "Reasoning",
    href: "/chat/new?mode=reasoning",
    icon: Brain,
  },
  {
    name: "Writing",
    href: "/chat/new?mode=writing",
    icon: PenLine,
  },
];

export default function Sidebar({
  email,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  const currentMode =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get(
          "mode",
        )
      : null;

  const displayEmail = email || "NOVA User";

  return (
    <aside className="flex h-screen w-[230px] shrink-0 flex-col border-r border-white/[0.08] bg-[#080b18] text-white">
      {/* Logo */}
      <div className="flex h-[72px] shrink-0 items-center border-b border-white/[0.06] px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-600/20">
            <Sparkles size={16} />
          </div>

          <span className="text-sm font-bold tracking-wide">
            NOVA AI
          </span>
        </div>
      </div>

      {/* New Chat */}
      <div className="shrink-0 px-3 pt-4">
        <Link
          href="/chat/new"
          className="flex h-11 w-full items-center gap-2.5 rounded-xl bg-[#171b2c] px-4 text-sm font-medium text-white transition hover:bg-[#20253a]"
        >
          <Plus size={17} />
          <span>New chat</span>
        </Link>
      </div>

      {/* Modes */}
      <div className="shrink-0 px-3 pt-5">
        <div className="space-y-1">
          {modes.map((mode) => {
            const Icon = mode.icon;

            const modeName = mode.name.toLowerCase();

            const active =
              (modeName === "general" &&
                pathname === "/chat/new" &&
                (!currentMode ||
                  currentMode === "general")) ||
              currentMode === modeName;

            return (
              <Link
                key={mode.name}
                href={mode.href}
                className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition ${
                  active
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-blue-200/80 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon
                  size={16}
                  className={
                    active
                      ? "text-violet-300"
                      : "text-blue-200/70"
                  }
                />

                <span>{mode.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Chat History */}
      <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-white/[0.06] pt-3">
        <ChatHistory />
      </div>

      {/* User */}
      <div className="shrink-0 border-t border-white/[0.08] p-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#101422] p-2.5">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-black text-xs font-medium">
              {displayEmail.charAt(0).toUpperCase()}
            </div>

            {/* Account */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-white">
                {displayEmail}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-violet-400">
                FREE PLAN
              </p>
            </div>
          </div>

          {/* Logout */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <LogOut size={14} />
              Logout
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}