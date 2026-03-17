import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseResumeText } from "@/lib/resume/resumeUtils";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ResumePdfDocument } from "@/lib/resume/ResumePdfDocument";

export const runtime = "nodejs";

async function buildPdf(resumeText: string): Promise<Buffer> {
  const { nameLines, sections } = parseResumeText(resumeText);

  try {
    console.log("[PDF] Generating PDF with @react-pdf/renderer");
    const element = React.createElement(ResumePdfDocument, { nameLines, sections });
    // @ts-expect-error - @react-pdf/renderer types can be strict with React.createElement
    const buffer = await renderToBuffer(element as React.ReactElement);
    return buffer;
  } catch (err) {
    console.error("[PDF] React-PDF error:", err);
    throw err;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { analysisId } = await req.json();

    if (!analysisId) {
      return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch optimized text from DB
    const { data: row, error } = await supabase
      .from("analyses")
      .select("optimized_resume")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single();

    if (error || !row) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const resumeText: string = row.optimized_resume;
    if (!resumeText || resumeText.trim().length < 5) {
      return NextResponse.json({ error: "No optimized resume text found" }, { status: 400 });
    }

    // 2. Generate PDF Buffer
    const pdfBuffer = await buildPdf(resumeText);
    
    if (!pdfBuffer || pdfBuffer.length < 100) {
      throw new Error("Generated PDF is invalid or empty");
    }

    // 3. Upload to Supabase Storage
    const fileName = `${user.id}/${analysisId}.pdf`;
    const bucketName = "resumes";

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[STORAGE] Upload error details:", {
        message: uploadError.message,
        name: uploadError.name,
        error: uploadError
      });
      
      if (uploadError.message.includes("not found")) {
        return NextResponse.json({ 
          error: "Storage bucket 'resumes' not found. Please contact the administrator to initialize storage." 
        }, { status: 500 });
      }

      // If storage fails for other reasons, we might still want to catch it or fallback
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 4. Generate Link (Public or Signed)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600, { download: "optimized-resume.pdf" }); // 1 hour, forced download

    if (signedUrlError || !signedUrlData) {
      console.error("[STORAGE] Signed URL error details:", signedUrlError);
      throw new Error(`Failed to generate download link: ${signedUrlError?.message || "Unknown error"}`);
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,
      fileName: "optimized-resume.pdf"
    });

  } catch (err: any) {
    console.error("download-resume route error:", err);
    return NextResponse.json({ 
      error: err.message || "Something went wrong while generating or storing the PDF" 
    }, { status: 500 });
  }
}
