import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAIImage } from "@/lib/ai/image-router";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const action =
      body.action || "generate";

    const prompt =
      body.prompt?.trim();

    const image =
      body.image || undefined;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const result = await generateAIImage(
      action,
      prompt,
      image
    );

    return NextResponse.json({
      success: true,
      image: result.image,
      model: result.model,
      action,
    });
  } catch (error: any) {
    console.error("IMAGE AI ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Image AI error",
      },
      { status: 500 }
    );
  }
}