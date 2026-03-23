import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("transparency_score", { ascending: false });

    if (error) {
      console.error("[VENDORS] Supabase query error:", error.message);
      return NextResponse.json(
        { status: "error", message: "Failed to fetch vendors" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "success", data });
  } catch (error: unknown) {
    console.error("[VENDORS] Unexpected error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
