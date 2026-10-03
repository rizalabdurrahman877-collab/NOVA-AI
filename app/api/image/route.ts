import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENAI_URL = "https://api.openai.com/v1/images/generations";

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

    const action = body.action || "generate";
    const prompt = String(body.prompt || "").trim();
    const image = body.image || null;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (
      ["edit", "enhance", "remove-background"].includes(action) &&
      !image
    ) {
      return NextResponse.json(
        { error: "Image is required for this action" },
        { status: 400 }
      );
    }

    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI_API_KEY belum diatur di .env.local" },
        { status: 500 }
      );
    }

    /*
     * CREATE
     * Generate gambar baru.
     */
    if (action === "generate") {
      const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.AI_IMAGE_MODEL || "gpt-image-2",
          prompt,
          size: "1024x1024",
          quality: "auto",
          n: 1,
        }),
      });

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json(
          {
            error: `OpenAI returned invalid JSON: ${text.slice(0, 500)}`,
          },
          { status: 502 }
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `OpenAI Image API error ${response.status}: ${
              data?.error?.message || text
            }`,
          },
          { status: response.status }
        );
      }

      const imageData =
        data?.data?.[0]?.b64_json
          ? `data:image/png;base64,${data.data[0].b64_json}`
          : data?.data?.[0]?.url || null;

      if (!imageData) {
        return NextResponse.json(
          {
            error: "OpenAI tidak mengembalikan gambar.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Gambar berhasil dibuat.",
        image: imageData,
        action,
      });
    }

    /*
     * Untuk Edit / Enhance / Remove BG:
     * sementara jangan kirim multipart ke endpoint generations.
     */
    if (
      action === "edit" ||
      action === "enhance" ||
      action === "remove-background"
    ) {
      return NextResponse.json(
        {
          error:
            "Create sudah siap. Endpoint Edit/Enhance/Remove BG perlu menggunakan image editing API yang berbeda.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: `Unknown image action: ${action}`,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("IMAGE API ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unexpected image API error",
      },
      { status: 500 }
    );
  }
}