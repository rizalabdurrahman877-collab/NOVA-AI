"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  Loader2,
} from "lucide-react";

type Conversation = {
  id: string;
  title: string;
  model: string | null;
  mode: string;
  created_at: string;
  updated_at: string;
};

export default function ChatHistory() {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    try {
      const response = await fetch("/api/conversations", {
        cache: "no-store",
      });

      if (!response.ok) {
        setChats([]);
        return;
      }

      const data = await response.json();

      setChats(data.conversations || []);
    } catch (error) {
      console.error("Gagal mengambil histori chat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();

    const handleRefresh = () => {
      loadChats();
    };

    window.addEventListener(
      "nova-chat-updated",
      handleRefresh,
    );

    return () => {
      window.removeEventListener(
        "nova-chat-updated",
        handleRefresh,
      );
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pb-2 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Chat History
        </span>

        <Link
          href="/chat/new"
          title="New Chat"
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
        >
          <Plus size={16} />
        </Link>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2
              size={17}
              className="animate-spin text-zinc-500"
            />
          </div>
        ) : chats.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <MessageSquare
              size={22}
              className="mx-auto mb-2 text-zinc-700"
            />

            <p className="text-xs text-zinc-500">
              Belum ada histori chat
            </p>

            <Link
              href="/chat/new"
              className="mt-2 inline-block text-xs text-violet-400 transition hover:text-violet-300"
            >
              Mulai chat baru
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-white/6"
              >
                <MessageSquare
                  size={15}
                  className="shrink-0 text-zinc-600 transition group-hover:text-violet-400"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-300 transition group-hover:text-white">
                    {chat.title || "New Chat"}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] capitalize text-zinc-600">
                    {chat.mode || "general"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}