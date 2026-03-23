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
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "success", data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
