import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, model, mode, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      conversations: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message || "Failed to load conversations",
      },
      { status: 500 },
    );
  }
}