import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/resume/resumeUtils";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ResumePdfDocument } from "@/lib/resume/ResumePdfDocument";
import { getEffectiveTier } from "@/lib/adminUtils";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { resumeText, templateId } = body;

    console.log("[PDF] Generation request received. Length:", resumeText?.length);

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }

    // --- Tier + usage check ---
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to download your resume." }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .single();
    const tier = await getEffectiveTier(supabase, user.id);
    void sub; // sub no longer needed directly

    const { data: usageData } = await supabase
      .from("usage_tracking")
      .select("pdf_downloads")
      .eq("user_id", user.id)
      .single();

    if (tier === "free" && (usageData?.pdf_downloads ?? 0) >= 2) {
      return NextResponse.json(
        { error: "Free plan limit reached: 2 PDF downloads per month. Upgrade to Starter for unlimited downloads." },
        { status: 403 }
      );
    }

    const { nameLines, sections } = parseResumeText(resumeText);
    
    console.log("[PDF] Generating PDF with @react-pdf/renderer");
    const element = React.createElement(ResumePdfDocument, { nameLines, sections, templateId });
    // @ts-expect-error - @react-pdf/renderer types can be strict with React.createElement
    const pdfBuffer = await renderToBuffer(element as React.ReactElement);

    // Increment usage counter
    await supabase
      .from("usage_tracking")
      .upsert({
        user_id: user.id,
        pdf_downloads: (usageData?.pdf_downloads ?? 0) + 1,
      }, { onConflict: "user_id", ignoreDuplicates: false });

    const fileName = `${user.id}/temp-${Date.now()}.pdf`;
    const bucketName = "resumes";

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (!uploadError) {
      const { data: signedUrlData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 3600);

      if (signedUrlData) {
        return NextResponse.json({
          success: true,
          url: signedUrlData.signedUrl,
          fileName: "optimized-resume.pdf"
        });
      }
    }

    // Fallback: Stream PDF directly
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=optimized-resume.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[PDF] Generate PDF route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating PDF" },
      { status: 500 }
    );
  }
}
