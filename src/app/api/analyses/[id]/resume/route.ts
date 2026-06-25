import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isResumeDocumentJson,
  resumeDocumentToText,
  type ResumeDocumentJson,
} from "@/lib/resume/resumeDocument";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const body = await req.json();
    const resumeDocument = body?.resume_document as unknown;

    if (!id) {
      return NextResponse.json({ error: "Analysis id is required" }, { status: 400 });
    }

    if (!resumeDocument || typeof resumeDocument !== "object") {
      console.error("[resume save] Validation failed. resumeDocument:", JSON.stringify(resumeDocument, null, 2));
      return NextResponse.json({ error: "Invalid resume_document JSON" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plainText = resumeDocumentToText(resumeDocument as ResumeDocumentJson);

    // First, check if the analysis exists and who owns it
    const { data: existing, error: fetchError } = await supabase
      .from("analyses")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error(`[resume save] Failed to fetch existing analysis for id ${id}:`, fetchError);
      return NextResponse.json({ error: "Analysis not found or invalid ID", details: fetchError }, { status: 404 });
    }

    let wasClaimed = false;
    if (existing && existing.user_id === null) {
      // Auto-claim the analysis if it was created by a guest and they are now logged in
      console.log(`[resume save] Auto-claiming analysis ${id} for user ${user.id}`);
      const { error: claimError } = await supabase.from("analyses").update({ user_id: user.id }).eq("id", id);
      if (claimError) {
        console.error(`[resume save] Failed to claim analysis:`, claimError);
        return NextResponse.json({ error: "Failed to claim analysis", details: claimError }, { status: 500 });
      }
      wasClaimed = true;
    } else if (existing && existing.user_id !== user.id) {
      console.error(`[resume save] Analysis ${id} belongs to user ${existing.user_id}, but current user is ${user.id}`);
      return NextResponse.json({ error: "Analysis belongs to a different user" }, { status: 403 });
    }

    // After a just-claimed analysis the user_id is now set — filter only on id
    // to avoid a race condition where the user_id filter returns 0 rows.
    let query = supabase
      .from("analyses")
      .update({
        resume_document: resumeDocument,
        optimized_resume: plainText,
      })
      .eq("id", id);

    if (!wasClaimed) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query
      .select("id, resume_document, optimized_resume")
      .single();

    if (error || !data) {
      console.error("[resume save] error:", error);
      return NextResponse.json({ error: "Failed to save resume", details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, analysis: data });
  } catch (err) {
    console.error("[resume save] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong while saving" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Analysis id is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("analyses")
      .select("id, resume_document, optimized_resume")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, analysis: data });
  } catch (err) {
    console.error("[resume get] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
