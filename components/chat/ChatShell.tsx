"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  Send,
  Plus,
  LogOut,
  Sparkles,
  Code2,
  Brain,
  PenLine,
  Globe,
  Paperclip,
  MessageSquare,
  Loader2,
  Menu,
  X,
  Image as ImageIcon,
  WandSparkles,
  Maximize2,
  Eraser,
  Eye,
  Upload,
  Trash2,
} from "lucide-react";

import type { AIMode } from "@/types/ai";

/* =========================================================
   MODES
========================================================= */

const modes: {
  id: AIMode;
  label: string;
  icon: typeof Code2;
}[] = [
  {
    id: "general",
    label: "General",
    icon: Globe,
  },
  {
    id: "coding",
    label: "Coding",
    icon: Code2,
  },
  {
    id: "reasoning",
    label: "Reasoning",
    icon: Brain,
  },
  {
    id: "writing",
    label: "Writing",
    icon: PenLine,
  },
];

/* =========================================================
   TYPES
========================================================= */

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

type Conversation = {
  id: string;
  title: string;
  model: string | null;
  mode: string;
  created_at: string;
  updated_at: string;
};

type ImageAction =
  | "generate"
  | "edit"
  | "enhance"
  | "remove-background"
  | "analyze";

/* =========================================================
   COMPONENT
========================================================= */

export default function ChatShell({
  conversationId,
}: {
  conversationId?: string;
}) {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* =======================================================
     USER
  ======================================================= */

  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState("free");

  /* =======================================================
     CHAT
  ======================================================= */

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [input, setInput] = useState("");

  const [mode, setMode] =
    useState<AIMode>("general");

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     HISTORY
  ======================================================= */

  const [chats, setChats] =
    useState<Conversation[]>([]);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  /* =======================================================
     MOBILE SIDEBAR
  ======================================================= */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* =======================================================
     IMAGE AI
  ======================================================= */

  const [imageAction, setImageAction] =
    useState<ImageAction | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [imageFileName, setImageFileName] =
    useState("");

  /* =======================================================
     LOAD USER + CONVERSATION
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (!mounted) return;

      setUser(user);

      /* Profile */

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .maybeSingle();

      if (profile?.plan) {
        setPlan(profile.plan);
      }

      /* Conversation */

      if (conversationId) {
        const { data: conversation } =
          await supabase
            .from("conversations")
            .select("mode")
            .eq("id", conversationId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (conversation?.mode) {
          setMode(
            conversation.mode as AIMode,
          );
        }

        /* Messages */

        const { data: messageData } =
          await supabase
            .from("messages")
            .select("role, content")
            .eq(
              "conversation_id",
              conversationId,
            )
            .order("created_at", {
              ascending: true,
            });

        if (messageData) {
          setMessages(
            messageData.filter(
              (message: any) =>
                message.role !== "system",
            ) as ChatMessage[],
          );
        }
      } else {
        setMessages([]);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [conversationId, router]);

  /* =======================================================
     LOAD HISTORY
  ======================================================= */

  async function loadHistory() {
    try {
      const response = await fetch(
        "/api/conversations",
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        setChats([]);
        return;
      }

      const data = await response.json();

      setChats(
        data.conversations || [],
      );
    } catch (error) {
      console.error(
        "Failed to load chat history:",
        error,
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();

    const refreshHistory = () => {
      loadHistory();
    };

    window.addEventListener(
      "nova-chat-updated",
      refreshHistory,
    );

    return () => {
      window.removeEventListener(
        "nova-chat-updated",
        refreshHistory,
      );
    };
  }, []);

  /* =======================================================
     NEW CHAT
  ======================================================= */

  function newChat() {
    setMessages([]);
    setInput("");
    setMode("general");

    setImageAction(null);
    setSelectedImage(null);
    setImageFileName("");

    setSidebarOpen(false);

    router.push("/chat/new");
  }

  /* =======================================================
     CHANGE MODE
  ======================================================= */

  function changeMode(newMode: AIMode) {
    setMode(newMode);
    setSidebarOpen(false);
  }

  /* =======================================================
     FILE PICKER
  ======================================================= */

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(
        "Ukuran gambar maksimal 10 MB.",
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result === "string"
      ) {
        setSelectedImage(reader.result);
        setImageFileName(file.name);

        /*
         * Jika user upload gambar
         * tanpa memilih tool terlebih dahulu,
         * otomatis masuk Analyze.
         */

        if (!imageAction) {
          setImageAction("analyze");
        }
      }
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  function removeSelectedImage() {
    setSelectedImage(null);
    setImageFileName("");

    if (
      imageAction !== "generate"
    ) {
      setImageAction(null);
    }
  }

  /* =======================================================
     SELECT IMAGE TOOL
  ======================================================= */

  function chooseImageTool(
    action: ImageAction,
  ) {
    setImageAction(action);

    /*
     * Tool yang membutuhkan gambar
     * otomatis membuka file picker.
     */

    if (
      action !== "generate" &&
      action !== "analyze" &&
      !selectedImage
    ) {
      setTimeout(() => {
        openFilePicker();
      }, 50);
    }

    if (
      action === "analyze" &&
      !selectedImage
    ) {
      setTimeout(() => {
        openFilePicker();
      }, 50);
    }
  }

  /* =======================================================
     SEND NORMAL CHAT
  ======================================================= */

  async function sendChat() {
    if (!input.trim() || loading) {
      return;
    }

    const text = input.trim();

    setInput("");

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: text,
      },
    ];

    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            conversationId:
              conversationId === "new"
                ? undefined
                : conversationId,

            mode,

            messages: newMessages,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Request failed",
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.content,
        },
      ]);

      window.dispatchEvent(
        new Event("nova-chat-updated"),
      );

      if (
        data.conversationId &&
        conversationId !==
          data.conversationId
      ) {
        router.replace(
          `/chat/${data.conversationId}`,
        );
      }
    } catch (error: any) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Error: ${
            error?.message ||
            "Something went wrong"
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     SEND IMAGE AI
  ======================================================= */

  async function sendImageRequest() {
    if (!input.trim() || loading) {
      return;
    }

    const prompt = input.trim();

    setInput("");
    setLoading(true);

    const userMessage: ChatMessage = {
      role: "user",
      content: prompt,
      image:
        selectedImage || undefined,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    try {
      const response = await fetch(
        "/api/image",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action:
              imageAction || "generate",

            prompt,

            image: selectedImage,

            conversationId:
              conversationId === "new"
                ? undefined
                : conversationId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Image request failed",
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",

          content:
            data.message ||
            "Selesai. Berikut hasil dari NOVA AI.",

          image: data.image,
        },
      ]);

      setSelectedImage(null);
      setImageFileName("");
      setImageAction(null);

      window.dispatchEvent(
        new Event("nova-chat-updated"),
      );

      if (
        data.conversationId &&
        conversationId !==
          data.conversationId
      ) {
        router.replace(
          `/chat/${data.conversationId}`,
        );
      }
    } catch (error: any) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Image AI Error: ${
            error?.message ||
            "Something went wrong"
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     SEND
  ======================================================= */

  async function send() {
    if (!input.trim() || loading) {
      return;
    }

    /*
     * Jika sedang menggunakan
     * image tool → gunakan /api/image
     */

    if (imageAction) {
      await sendImageRequest();
      return;
    }

    /*
     * Chat biasa
     */

    await sendChat();
  }

  /* =======================================================
     KEYBOARD
  ======================================================= */

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      send();
    }
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function logout() {
    await createClient().auth.signOut();

    router.push("/login");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="relative flex h-dvh overflow-hidden bg-[#050816] text-white">

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[280px] flex-col
          border-r border-white/10
          bg-[#070a18]
          transition-transform duration-200

          md:relative
          md:z-20
          md:w-[280px]
          md:translate-x-0

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* SIDEBAR HEADER */}

        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 px-4">

          <div className="flex items-center gap-2">

            <span className="grid size-9 place-items-center rounded-xl bg-violet-500 shadow-lg shadow-violet-500/20">
              <Sparkles size={17} />
            </span>

            <div>
              <p className="text-sm font-bold">
                NOVA AI
              </p>

              <p className="text-[10px] text-slate-500">
                AI Workspace
              </p>
            </div>

          </div>

          {/* MOBILE CLOSE */}

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={18} />
          </button>

        </div>

        {/* NEW CHAT */}

        <div className="shrink-0 p-3">

          <button
            onClick={newChat}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            <Plus size={17} />
            New chat
          </button>

        </div>

        {/* =================================================
            MODES
        ================================================= */}

        <div className="shrink-0 px-3">

          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Modes
          </p>

          <div className="space-y-1">

            {modes.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    changeMode(
                      item.id,
                    )
                  }
                  className={`
                    flex h-10 w-full
                    items-center gap-3
                    rounded-xl px-3
                    text-sm
                    transition

                    ${
                      mode === item.id
                        ? "bg-violet-500/15 text-violet-200"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  <Icon size={17} />

                  <span>
                    {item.label}
                  </span>

                  {mode === item.id && (
                    <span className="ml-auto size-1.5 rounded-full bg-violet-400" />
                  )}
                </button>
              );
            })}

          </div>
        </div>

        {/* =================================================
            CHAT HISTORY
        ================================================= */}

        <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-white/10">

          <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">

            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Chat History
            </span>

            <button
              onClick={newChat}
              title="New Chat"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
            >
              <Plus size={15} />
            </button>

          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">

            {historyLoading ? (
              <div className="flex justify-center py-6">
                <Loader2
                  size={17}
                  className="animate-spin text-slate-600"
                />
              </div>
            ) : chats.length === 0 ? (
              <div className="px-3 py-8 text-center">

                <MessageSquare
                  size={22}
                  className="mx-auto mb-2 text-slate-700"
                />

                <p className="text-xs text-slate-600">
                  Belum ada chat
                </p>

              </div>
            ) : (
              <div className="space-y-1">

                {chats.map((chat) => {
                  const active =
                    conversationId ===
                    chat.id;

                  return (
                    <Link
                      key={chat.id}
                      href={`/chat/${chat.id}`}
                      onClick={() =>
                        setSidebarOpen(
                          false,
                        )
                      }
                      className={`
                        group flex items-center gap-2.5
                        rounded-xl px-3 py-2.5
                        transition

                        ${
                          active
                            ? "bg-violet-500/15 text-violet-200"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                        }
                      `}
                    >

                      <MessageSquare
                        size={15}
                        className={
                          active
                            ? "shrink-0 text-violet-400"
                            : "shrink-0 text-slate-600 group-hover:text-violet-400"
                        }
                      />

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-xs">
                          {chat.title ||
                            "New Chat"}
                        </p>

                        <p className="mt-0.5 text-[9px] capitalize text-slate-600">
                          {chat.mode ||
                            "general"}
                        </p>

                      </div>

                    </Link>
                  );
                })}

              </div>
            )}

          </div>
        </div>

        {/* =================================================
            USER
        ================================================= */}

        <div className="shrink-0 border-t border-white/10 p-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">

            <div className="flex items-center gap-3">

              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
                {user?.email
                  ?.charAt(0)
                  .toUpperCase() ||
                  "N"}
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-medium text-white">
                  {user?.email ||
                    "NOVA User"}
                </p>

                <p className="mt-1 text-[10px] uppercase text-violet-300">
                  {plan} plan
                </p>

              </div>

            </div>

            <button
              onClick={logout}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut size={14} />
              Logout
            </button>

          </div>

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="flex min-w-0 flex-1 flex-col">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 px-3 sm:px-5 md:px-7">

          <div className="flex items-center gap-3">

            {/* MOBILE MENU */}

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/10 md:hidden"
            >
              <Menu size={19} />
            </button>

            <div>

              <p className="text-sm font-semibold sm:text-base">

                {
                  modes.find(
                    (item) =>
                      item.id === mode,
                  )?.label
                }{" "}
                AI

              </p>

              <p className="text-[10px] text-slate-500 sm:text-xs">
                NOVA workspace
              </p>

            </div>

          </div>

          {/* DESKTOP NEW CHAT */}

          <button
            onClick={newChat}
            className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white sm:flex"
          >
            <Plus size={15} />
            New chat
          </button>

        </header>

        {/* =================================================
            MESSAGES
        ================================================= */}

        <section className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5 sm:py-6 md:px-10">

          {messages.length === 0 ? (

            <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 text-center">

              <div className="grid size-14 place-items-center rounded-2xl bg-violet-500/15 text-violet-300 sm:size-16 sm:rounded-3xl">
                <Sparkles size={25} />
              </div>

              <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
                How can NOVA help?
              </h1>

              <p className="mt-3 max-w-md text-xs leading-6 text-slate-500 sm:text-sm">
                Ask questions, write code,
                create images, edit images,
                or analyze your files.
              </p>

              {/* QUICK ACTIONS */}

              <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">

                <button
                  onClick={() =>
                    setMode("coding")
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Code2
                    size={16}
                    className="mb-2 text-violet-400"
                  />

                  Help me with code
                </button>

                <button
                  onClick={() =>
                    setMode("writing")
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <PenLine
                    size={16}
                    className="mb-2 text-violet-400"
                  />

                  Help me write
                </button>

                <button
                  onClick={() =>
                    chooseImageTool(
                      "generate",
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <ImageIcon
                    size={16}
                    className="mb-2 text-violet-400"
                  />

                  Create an image
                </button>

                <button
                  onClick={() =>
                    chooseImageTool(
                      "analyze",
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Eye
                    size={16}
                    className="mb-2 text-violet-400"
                  />

                  Analyze an image
                </button>

              </div>

            </div>

          ) : (

            <div className="mx-auto max-w-3xl space-y-5 sm:space-y-7">

              {messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={
                      message.role ===
                      "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >

                    <div
                      className={`
                        max-w-[94%]
                        rounded-2xl
                        px-3.5 py-3
                        text-sm
                        leading-7
                        sm:max-w-[85%]
                        sm:px-4

                        ${
                          message.role ===
                          "user"
                            ? "bg-violet-500 text-white"
                            : "border border-white/10 bg-white/[.05] text-slate-200"
                        }
                      `}
                    >

                      {message.content && (
                        <pre className="whitespace-pre-wrap break-words font-sans">
                          {message.content}
                        </pre>
                      )}

                      {message.image && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">

                          <img
                            src={message.image}
                            alt="NOVA AI generated"
                            className="block max-h-[600px] w-full object-contain"
                          />

                        </div>
                      )}

                    </div>

                  </div>

                ),
              )}

              {/* LOADING */}

              {loading && (
                <div className="flex justify-start">

                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-slate-500">

                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                    NOVA sedang berpikir...

                  </div>

                </div>
              )}

            </div>

          )}

        </section>

        {/* =================================================
            COMPOSER
        ================================================= */}

        <div className="shrink-0 border-t border-white/10 bg-[#050816] p-3 sm:p-4 md:p-6">

          {/* =================================================
              SELECTED IMAGE PREVIEW
          ================================================= */}

          {selectedImage && (
            <div className="mx-auto mb-3 flex max-w-3xl items-end gap-3">

              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">

                <img
                  src={selectedImage}
                  alt="Selected image"
                  className="h-20 w-20 object-cover sm:h-24 sm:w-24"
                />

                <button
                  type="button"
                  onClick={
                    removeSelectedImage
                  }
                  className="absolute right-1 top-1 grid size-7 place-items-center rounded-lg bg-black/70 text-white transition hover:bg-red-500"
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>

              </div>

              <div className="min-w-0 pb-1">

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">

                  <Upload size={11} />

                  <span className="max-w-[180px] truncate sm:max-w-[260px]">
                    {imageFileName}
                  </span>

                </div>

                {imageAction && (
                  <p className="mt-1 text-[10px] capitalize text-violet-400">
                    {imageAction.replace(
                      "-",
                      " ",
                    )}{" "}
                    mode
                  </p>
                )}

              </div>

            </div>
          )}

          {/* =================================================
              AI TOOLS
          ================================================= */}

          <div className="mx-auto mb-2 max-w-3xl">

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">

              {/* CREATE */}

              <button
                type="button"
                onClick={() =>
                  chooseImageTool(
                    "generate",
                  )
                }
                className={`
                  flex shrink-0
                  items-center gap-2
                  rounded-xl
                  border
                  px-3 py-2
                  text-xs
                  transition

                  ${
                    imageAction ===
                    "generate"
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                <ImageIcon size={15} />
                Create
              </button>

              {/* EDIT */}

              <button
                type="button"
                onClick={() =>
                  chooseImageTool(
                    "edit",
                  )
                }
                className={`
                  flex shrink-0
                  items-center gap-2
                  rounded-xl
                  border
                  px-3 py-2
                  text-xs
                  transition

                  ${
                    imageAction ===
                    "edit"
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                <WandSparkles size={15} />
                Edit
              </button>

              {/* ENHANCE */}

              <button
                type="button"
                onClick={() =>
                  chooseImageTool(
                    "enhance",
                  )
                }
                className={`
                  flex shrink-0
                  items-center gap-2
                  rounded-xl
                  border
                  px-3 py-2
                  text-xs
                  transition

                  ${
                    imageAction ===
                    "enhance"
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                <Maximize2 size={15} />
                Enhance
              </button>

              {/* REMOVE BG */}

              <button
                type="button"
                onClick={() =>
                  chooseImageTool(
                    "remove-background",
                  )
                }
                className={`
                  flex shrink-0
                  items-center gap-2
                  rounded-xl
                  border
                  px-3 py-2
                  text-xs
                  transition

                  ${
                    imageAction ===
                    "remove-background"
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                <Eraser size={15} />
                Remove BG
              </button>

              {/* ANALYZE */}

              <button
                type="button"
                onClick={() =>
                  chooseImageTool(
                    "analyze",
                  )
                }
                className={`
                  flex shrink-0
                  items-center gap-2
                  rounded-xl
                  border
                  px-3 py-2
                  text-xs
                  transition

                  ${
                    imageAction ===
                    "analyze"
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                <Eye size={15} />
                Analyze
              </button>

            </div>

          </div>

          {/* =================================================
              INPUT BAR
          ================================================= */}

          <div className="mx-auto flex max-w-3xl items-end gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 sm:gap-2 sm:p-2">

            {/* UPLOAD */}

            <button
              type="button"
              onClick={openFilePicker}
              className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
              title="Upload image"
            >
              <Paperclip size={18} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={
                handleImageUpload
              }
              className="hidden"
            />

            {/* TEXT */}

            <textarea
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value,
                )
              }
              onKeyDown={
                handleKeyDown
              }
              rows={1}
              placeholder={
                imageAction ===
                "generate"
                  ? "Describe the image you want..."
                  : imageAction === "edit"
                    ? "What should NOVA change?"
                    : imageAction ===
                        "enhance"
                      ? "How should NOVA improve it?"
                      : imageAction ===
                          "remove-background"
                        ? "Describe what you want..."
                        : imageAction ===
                            "analyze"
                          ? "Ask about this image..."
                          : "Ask NOVA anything..."
              }
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-slate-600 sm:min-h-12 sm:py-3"
            />

            {/* SEND */}

            <button
              onClick={send}
              disabled={
                loading ||
                !input.trim()
              }
              className={`
                grid size-11
                shrink-0
                place-items-center
                rounded-xl
                text-white
                transition
                disabled:cursor-not-allowed
                disabled:opacity-40
                sm:size-12

                ${
                  imageAction
                    ? "bg-violet-500 hover:bg-violet-400"
                    : "bg-violet-500 hover:bg-violet-400"
                }
              `}
            >

              {loading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : imageAction ? (
                <WandSparkles size={18} />
              ) : (
                <Send size={18} />
              )}

            </button>

          </div>

          {/* =================================================
              ACTIVE IMAGE MODE
          ================================================= */}

          {imageAction && (
            <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2">

              <div className="flex items-center gap-2 text-xs text-violet-300">

                <WandSparkles size={14} />

                <span className="capitalize">
                  {imageAction.replace(
                    "-",
                    " ",
                  )}{" "}
                  mode aktif
                </span>

              </div>

              <button
                type="button"
                onClick={() => {
                  setImageAction(null);
                  setSelectedImage(null);
                  setImageFileName("");
                }}
                className="text-[10px] text-slate-500 transition hover:text-white"
              >
                Tutup
              </button>

            </div>
          )}

          {/* DISCLAIMER */}

          <p className="mx-auto mt-2 max-w-3xl text-center text-[9px] text-slate-600 sm:text-[11px]">
            NOVA dapat membuat kesalahan.
            Verifikasi informasi penting.
          </p>

        </div>

      </main>
    </div>
  );
}