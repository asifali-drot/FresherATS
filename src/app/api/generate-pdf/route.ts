import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/resume/resumeUtils";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ResumePdfDocument } from "@/lib/resume/ResumePdfDocument";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { resumeText } = body;

    console.log("[PDF] Generation request received. Length:", resumeText?.length);

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }

    const { nameLines, sections } = parseResumeText(resumeText);
    
    console.log("[PDF] Generating PDF with @react-pdf/renderer");
    const element = React.createElement(ResumePdfDocument, { nameLines, sections });
    // @ts-expect-error - @react-pdf/renderer types can be strict with React.createElement
    const pdfBuffer = await renderToBuffer(element as React.ReactElement);

    // Check if user is logged in to store it
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
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
    }

    // Fallback: Stream PDF (Guest or Storage Error)
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
