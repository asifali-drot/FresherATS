import { NextRequest, NextResponse } from "next/server";
import { parseCoverLetterText } from "@/lib/cover-letter/utils";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { CoverLetterPdfDocument } from "@/lib/cover-letter/CoverLetterPdfDocument";
import { downloadImageAsBase64 } from "@/lib/image-utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { 
      coverLetterText, 
      templateId, 
      avatarUrl: bodyAvatarUrl,
      jobTitle,
      jobDescription,
      companyName
    } = body;

    console.log("[PDF Cover Letter] Generation request received. Length:", coverLetterText?.length);

    if (!coverLetterText || coverLetterText.trim().length === 0) {
      return NextResponse.json({ error: "No cover letter text provided" }, { status: 400 });
    }

    const data = parseCoverLetterText(coverLetterText);
    const resolvedTemplateId = templateId || "professional";

    // Check if user is logged in to get avatar_url and storage access
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const avatarUrl = bodyAvatarUrl || user?.user_metadata?.avatar_url || undefined;

    console.log("[PDF Cover Letter] Generating PDF with @react-pdf/renderer using template:", resolvedTemplateId);
    
    // Convert avatar URL to base64 data URI for @react-pdf/renderer
    const avatarDataUri = await downloadImageAsBase64(avatarUrl);
    console.log("[PDF Cover Letter] Avatar conversion:", avatarUrl ? `converted to ${avatarDataUri?.substring(0, 50)}...` : 'no avatar');
    
    const element = React.createElement(CoverLetterPdfDocument, { data, templateId: resolvedTemplateId, avatarUrl: avatarDataUri });
    // @ts-expect-error - @react-pdf/renderer types can be strict with React.createElement
    const pdfBuffer = await renderToBuffer(element as React.ReactElement);

    if (user) {
      const fileName = `${user.id}/cover-letters/cover-letter-${Date.now()}.pdf`;
      const bucketName = "cover-letters";

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (!uploadError) {
        // Save metadata to cover_letters DB table
        const { error: dbError } = await supabase
          .from("cover_letters")
          .insert({
            user_id: user.id,
            cover_letter_text: coverLetterText,
            template_id: resolvedTemplateId,
            avatar_url: avatarUrl || null,
            file_path: fileName,
            job_title: jobTitle || null,
            job_description: jobDescription || null,
            company_name: companyName || null,
          });

        if (dbError) {
          console.error("[PDF Cover Letter] Database insert failed:", dbError.message);
        }

        const { data: signedUrlData } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileName, 3600);

        if (signedUrlData) {
          return NextResponse.json({
            success: true,
            url: signedUrlData.signedUrl,
            fileName: "cover-letter.pdf"
          });
        }
      } else {
        console.warn("[PDF Cover Letter] Supabase storage upload failed, falling back to direct stream:", uploadError.message);
      }
    }

    // Fallback: Stream PDF directly (Guest or Storage Error)
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cover-letter.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[PDF Cover Letter] Generate PDF route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating PDF" },
      { status: 500 }
    );
  }
}
