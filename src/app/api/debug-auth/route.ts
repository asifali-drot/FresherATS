export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Check auth
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const userId = authData?.user?.id ?? null;

    // 2. Try a test insert if logged in
    let insertResult: {error?: string | null; id?: string | null} = {};
    if (userId) {
      const { data, error } = await supabase
        .from("analyses")
        .insert({
          user_id: userId,
          resume_text: "debug-test",
          job_description: null,
          score: 0,
          summary: "debug-test-summary",
          suggestions: [],
          optimized_resume: "debug-test",
        })
        .select("id")
        .single();

      insertResult = {
        error: error ? `${error.code}: ${error.message} | hint: ${error.hint} | details: ${error.details}` : null,
        id: data?.id ?? null,
      };

      // Clean up the test row if insert succeeded
      if (data?.id) {
        await supabase.from("analyses").delete().eq("id", data.id);
      }
    }

    // 3. Check table columns exist
    const { data: colCheck, error: colError } = await supabase
      .from("analyses")
      .select("id, user_id, optimized_resume")
      .limit(1);

    return NextResponse.json({
      authenticated: !!userId,
      userId,
      authError: authError?.message ?? null,
      insertResult,
      columnCheckError: colError ? `${colError.code}: ${colError.message}` : null,
      hasRows: Array.isArray(colCheck) && colCheck.length > 0,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
