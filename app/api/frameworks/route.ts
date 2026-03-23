import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const { data, error } = await supabase
      .from("frameworks")
      .select("*")
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("[FRAMEWORKS] Supabase query error:", error.message);
      return NextResponse.json(
        { status: "error", message: "Failed to fetch frameworks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "success", data });
  } catch (error: unknown) {
    console.error("[FRAMEWORKS] Unexpected error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
