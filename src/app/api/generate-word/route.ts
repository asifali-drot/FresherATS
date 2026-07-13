import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/resume/resumeUtils";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveTier } from "@/lib/adminUtils";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  UnderlineType,
} from "docx";

export const runtime = "nodejs";

// ─── Rich-text tokeniser (mirrors ResumePdfDocument) ─────────────────────────
// Supported: **bold**, _italic_, __underline__, ==highlight==
function parseRichRuns(text: string): TextRun[] {
  const TOKEN_RE = /(\*\*.*?\*\*|__.*?__|_.*?_|==.*?==)/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    parts.push(m[0]);
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts
    .filter(Boolean)
    .map((part) => {
      // Bold: **text**
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return new TextRun({ text: part.slice(2, -2), bold: true, size: 20, color: "334155" });
      }
      // Underline: __text__
      if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
        return new TextRun({ text: part.slice(2, -2), underline: { type: UnderlineType.SINGLE }, size: 20, color: "334155" });
      }
      // Italic: _text_
      if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
        return new TextRun({ text: part.slice(1, -1), italics: true, size: 20, color: "334155" });
      }
      // Highlight: ==text==
      if (part.startsWith("==") && part.endsWith("==") && part.length > 4) {
        return new TextRun({ text: part.slice(2, -2), highlight: "yellow", size: 20, color: "334155" });
      }
      return new TextRun({ text: part, size: 20, color: "334155" });
    });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { resumeText } = body;

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to download your resume." },
        { status: 401 }
      );
    }

    const tier = await getEffectiveTier(supabase, user.id);

    const { data: usageData } = await supabase
      .from("usage_tracking")
      .select("pdf_downloads")
      .eq("user_id", user.id)
      .single();

    if (tier === "free" && (usageData?.pdf_downloads ?? 0) >= 2) {
      return NextResponse.json(
        { error: "Free plan limit reached: 2 downloads per month. Upgrade to Starter for unlimited downloads." },
        { status: 403 }
      );
    }

    const { nameLines, sections } = parseResumeText(resumeText);

    const children: Paragraph[] = [];

    // ── Header: Name (centered, UPPERCASE, bold, large) ──────────────────────
    if (nameLines.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: nameLines[0].toUpperCase(),
              bold: true,
              size: 48,           // 24pt — matches PDF nameFontSize
              color: "0f172a",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        })
      );

      // Contact lines — joined with bullet separators on a single centred line
      if (nameLines.length > 1) {
        const contactParts: TextRun[] = [];
        nameLines.slice(1).forEach((line, idx) => {
          if (idx > 0) {
            contactParts.push(
              new TextRun({ text: "  •  ", size: 18, color: "e2e8f0" })
            );
          }
          contactParts.push(new TextRun({ text: line, size: 18, color: "475569" }));
        });
        children.push(
          new Paragraph({
            children: contactParts,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: "0f172a", space: 10 },
            },
          })
        );
      } else {
        // No contact lines — just add a bottom border paragraph
        children.push(
          new Paragraph({
            children: [],
            spacing: { after: 120 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: "0f172a", space: 10 },
            },
          })
        );
      }
    }

    // ── Sections ──────────────────────────────────────────────────────────────
    for (const section of sections) {
      // Section title: UPPERCASE, bold, with blue accent underline (via bottom border)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title.toUpperCase(),
              bold: true,
              size: 24,           // 12pt — matches PDF sectionTitleFontSize
              color: "0f172a",
              allCaps: true,
            }),
          ],
          spacing: { before: 240, after: 100 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "2563eb", space: 4 },
          },
        })
      );

      if (section.title === "SKILLS") {
        // Skills: render comma-separated in a single row
        const skills = section.content
          .map((line) => line.replace(/^[\*•\-]\s*/, "").trim())
          .filter(Boolean);

        if (skills.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: skills.join(", "),
                  size: 20,
                  color: "334155",
                }),
              ],
              spacing: { after: 80 },
            })
          );
        }
      } else {
        for (const line of section.content) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const isBullet =
            trimmed.startsWith("•") ||
            /^\*\s/.test(trimmed) ||
            /^-\s/.test(trimmed);

          const rawText = isBullet ? trimmed.replace(/^[\*•\-]\s*/, "") : trimmed;
          const runs = parseRichRuns(rawText);

          children.push(
            new Paragraph({
              children: runs,
              bullet: isBullet ? { level: 0 } : undefined,
              spacing: { after: isBullet ? 40 : 80 },
              indent: isBullet ? { left: 360 } : undefined,
              alignment: AlignmentType.BOTH,   // justified, matching PDF
            })
          );
        }
      }
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "Calibri", size: 20, color: "1e293b" },
            paragraph: { spacing: { line: 276 } },   // ~1.15 line-height
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              // Match PDF padding ~40pt → Word twips (1pt = 20 twips, 0.75in = 1080 twips)
              margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    await supabase.from("usage_tracking").upsert(
      { user_id: user.id, pdf_downloads: (usageData?.pdf_downloads ?? 0) + 1 },
      { onConflict: "user_id", ignoreDuplicates: false }
    );

    const fileName = `${user.id}/word-${Date.now()}.docx`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      });

    if (!uploadError) {
      const { data: signedUrlData } = await supabase.storage
        .from("resumes")
        .createSignedUrl(fileName, 3600);

      if (signedUrlData) {
        return NextResponse.json({ success: true, url: signedUrlData.signedUrl, fileName: "optimized-resume.docx" });
      }
    }

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=optimized-resume.docx",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Word] Generate Word route error:", error);
    return NextResponse.json({ error: "Something went wrong while generating the Word document" }, { status: 500 });
  }
}
