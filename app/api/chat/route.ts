import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAI } from "@/lib/ai/router";
import type { AIMode, ChatMessage } from "@/types/ai";
export async function POST(req: Request) {
  try {
    const s = await createClient();
    const {
      data: { user },
    } = await s.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const mode = (body.mode || "general") as AIMode;
    const messages = (body.messages || []) as ChatMessage[];
    if (!messages.length)
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 },
      );
    let conversationId = body.conversationId as string | undefined;
    if (!conversationId) {
      const title =
        messages.find((m) => m.role === "user")?.content?.slice(0, 60) ||
        "New chat";
      const { data, error } = await s
        .from("conversations")
        .insert({ user_id: user.id, title, model: mode })
        .select("id")
        .single();
      if (error) throw error;
      conversationId = data.id;
    } else {
      const { data: c } = await s
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!c)
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
    }
    const last = messages.filter((m) => m.role === "user").at(-1);
    if (last)
      await s
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "user",
          content: last.content,
        });
    const result = await generateAI(mode, messages);
    await s
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: result.content,
      });
    return NextResponse.json({
      conversationId,
      content: result.content,
      model: result.model,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected server error" },
      { status: 500 },
    );
  }
}
