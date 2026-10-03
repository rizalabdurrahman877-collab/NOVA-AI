import type { AIMode, ChatMessage } from "@/types/ai";

const modelMap: Record<AIMode, string> = {
  general: process.env.AI_MODEL || "default-model",

  coding:
    process.env.AI_CODING_MODEL ||
    process.env.AI_MODEL ||
    "default-model",

  reasoning:
    process.env.AI_REASONING_MODEL ||
    process.env.AI_MODEL ||
    "default-model",

  writing:
    process.env.AI_WRITING_MODEL ||
    process.env.AI_MODEL ||
    "default-model",

  multimodal:
    process.env.AI_VISION_MODEL ||
    process.env.AI_MODEL ||
    "default-model",
};

const systemMap: Record<AIMode, string> = {
  general:
    "You are NOVA AI, a helpful general AI assistant. Be accurate and concise.",

  coding:
    "You are NOVA AI Coding, an expert developer assistant. Produce correct, maintainable code and explain important decisions.",

  reasoning:
    "You are NOVA AI Reasoning. Analyze problems carefully, verify assumptions, and present clear conclusions without exposing hidden chain-of-thought.",

  writing:
    "You are NOVA AI Writing. Help draft, rewrite, summarize, and polish text while preserving the user's intent.",

  multimodal:
    "You are NOVA AI Multimodal. Analyze supplied content when available and answer clearly.",
};

export async function generateAI(
  mode: AIMode,
  messages: ChatMessage[],
) {
  if (!process.env.AI_API_KEY) {
    throw new Error(
      "AI_API_KEY belum diatur. Salin .env.example menjadi .env.local dan isi API key.",
    );
  }

  const base = (
    process.env.AI_BASE_URL || "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  const body = {
    model: modelMap[mode],
    messages: [
      {
        role: "system",
        content: systemMap[mode],
      },
      ...messages,
    ],
    stream: false,
  };

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },

    body: JSON.stringify(body),

    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();

    throw new Error(
      `AI provider error ${res.status}: ${text.slice(0, 500)}`,
    );
  }

  const data = await res.json();

  return {
    content:
      data.choices?.[0]?.message?.content ||
      "No response.",

    model: body.model,
  };
}