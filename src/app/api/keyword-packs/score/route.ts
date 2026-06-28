import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPack } from "@/lib/keyword-packs/data";
import { scoreResumeAgainstPack } from "@/lib/keyword-packs/score";
import { getEntitlement, consumeCredit } from "@/lib/entitlements/entitlements";
import { PackScanResult } from "@/lib/keyword-packs/types";

export async function POST(req: Request) {
  try {
    const { packId, resumeText: rawText, analysisId } = await req.json();

    if (!packId || typeof packId !== "string") {
      return NextResponse.json({ ok: false, error: "packId is required" }, { status: 400 });
    }

    const pack = getPack(packId);
    if (!pack) {
      return NextResponse.json({ ok: false, error: "Pack not found" }, { status: 404 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Must be logged in to use this feature." }, { status: 401 });
    }

    let resumeText = rawText;

    if (analysisId) {
      // Load resume_text from DB
      const { data: analysis, error: analysisError } = await supabase
        .from("analyses")
        .select("resume_text, optimized_resume")
        .eq("id", analysisId)
        .eq("user_id", user.id) // Ensure ownership
        .single();

      if (analysisError || !analysis) {
        return NextResponse.json({ ok: false, error: "Analysis not found or access denied." }, { status: 404 });
      }

      resumeText = analysis.optimized_resume || analysis.resume_text || "";
    }

    if (!resumeText || typeof resumeText !== "string" || resumeText.length < 80) {
      return NextResponse.json({ ok: false, error: "Resume text is too short or missing." }, { status: 400 });
    }
    if (resumeText.length > 30000) {
      return NextResponse.json({ ok: false, error: "Resume text exceeds maximum length." }, { status: 400 });
    }

    // Determine tier for gating
    const entitlement = user ? await getEntitlement(user.id) : null;
    let isPro = entitlement?.isPro || false;

    // Check if they are not Pro, but have credits, we can consume one.
    if (!isPro && entitlement && entitlement.credits > 0) {
       const consumed = await consumeCredit(user.id, "single_resume_pack");
       if (consumed) {
         isPro = true;
       }
    }

    // Run scoring engine
    const fullResult = scoreResumeAgainstPack(resumeText, pack);

    let finalResult: Partial<PackScanResult> & { gated?: boolean } = fullResult;

    if (!isPro) {
      // Redact detailed lists
      finalResult = {
        packId: fullResult.packId,
        company: fullResult.company,
        role: fullResult.role,
        level: fullResult.level,
        ats: fullResult.ats,
        overall: fullResult.overall,
        hardScore: fullResult.hardScore,
        valuesScore: fullResult.valuesScore,
        // Send counts instead of full arrays where applicable
        missingHardSkills: new Array(fullResult.missingHardSkills.length).fill("hidden") as any,
        matchedHardSkills: new Array(fullResult.matchedHardSkills.length).fill("hidden") as any,
        matchedNiceToHave: new Array(fullResult.matchedNiceToHave.length).fill("hidden") as any,
        missingValues: new Array(fullResult.missingValues.length).fill({ label: "hidden", description: "" }) as any,
        matchedValues: new Array(fullResult.matchedValues.length).fill({ label: "hidden", description: "", hits: 0 }) as any,
        presentVerbs: fullResult.presentVerbs, // Safe to show
        suggestedVerbs: new Array(fullResult.suggestedVerbs.length).fill("hidden") as any,
        redFlagsFound: new Array(fullResult.redFlagsFound.length).fill("hidden") as any,
        redFlagPenalty: fullResult.redFlagPenalty,
        formattingChecklist: fullResult.formattingChecklist, // Safe to show
        newGradEmphasis: fullResult.newGradEmphasis, // Safe to show
        sampleRewrites: [], // Hide
        gated: true
      } as Partial<PackScanResult> & { gated: boolean };
    }

    // Save scan to DB asynchronously (best effort)
    if (user) {
      supabase.from("pack_scans").insert({
        user_id: user.id,
        pack_id: packId,
        overall: fullResult.overall,
        hard_score: fullResult.hardScore,
        values_score: fullResult.valuesScore,
        result: fullResult
      }).then(({ error }) => {
        if (error) console.error("Failed to insert pack scan:", error);
      });
    }

    return NextResponse.json({ ok: true, result: finalResult });

  } catch (error: any) {
    console.error("Pack scan error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
