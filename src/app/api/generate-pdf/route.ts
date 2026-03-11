import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

// ATS-friendly section patterns to detect
const SECTION_PATTERNS = [
  { pattern: /^contact\b/i, title: "CONTACT" },
  { pattern: /^summary\b/i, title: "SUMMARY" },
  { pattern: /^objective\b/i, title: "OBJECTIVE" },
  { pattern: /^experience\b/i, title: "EXPERIENCE" },
  { pattern: /^work\s*experience\b/i, title: "EXPERIENCE" },
  { pattern: /^employment\b/i, title: "EMPLOYMENT" },
  { pattern: /^professional\s*experience\b/i, title: "EXPERIENCE" },
  { pattern: /^education\b/i, title: "EDUCATION" },
  { pattern: /^skills\b/i, title: "SKILLS" },
  { pattern: /^technical\s*skills\b/i, title: "SKILLS" },
  { pattern: /^certifications\b/i, title: "CERTIFICATIONS" },
  { pattern: /^certificates\b/i, title: "CERTIFICATIONS" },
  { pattern: /^projects\b/i, title: "PROJECTS" },
  { pattern: /^languages\b/i, title: "LANGUAGES" },
  { pattern: /^awards\b/i, title: "AWARDS" },
  { pattern: /^honors\b/i, title: "HONORS" },
  { pattern: /^publications\b/i, title: "PUBLICATIONS" },
  { pattern: /^volunteer\b/i, title: "VOLUNTEER" },
  { pattern: /^interests\b/i, title: "INTERESTS" },
  { pattern: /^references\b/i, title: "REFERENCES" },
];

interface ParsedSection {
  title: string;
  content: string[];
}

function detectSection(line: string): string | null {
  for (const { pattern, title } of SECTION_PATTERNS) {
    if (pattern.test(line.trim())) {
      return title;
    }
  }
  return null;
}

function parseResumeText(text: string): {
  nameLines: string[];
  sections: ParsedSection[];
} {
  const lines = text.split("\n").filter((line) => line.trim());
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  // Extract the first 1-3 lines as the candidate name / contact info
  const nameLines: string[] = [];
  let startIdx = 0;

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const trimmed = lines[i].trim();
    const section = detectSection(trimmed);
    if (section) break;

    if (
      trimmed.length > 0 &&
      trimmed.length < 100 &&
      !trimmed.startsWith("•") &&
      !trimmed.startsWith("-")
    ) {
      nameLines.push(trimmed);
      startIdx = i + 1;
    } else {
      break;
    }
  }

  for (let i = startIdx; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    const sectionTitle = detectSection(trimmedLine);

    if (sectionTitle) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: sectionTitle,
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(trimmedLine);
    } else {
      if (!sections.length) {
        currentSection = {
          title: "SUMMARY",
          content: [trimmedLine],
        };
      } else {
        sections[sections.length - 1].content.push(trimmedLine);
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { nameLines, sections };
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const { resumeText } = body;

    console.log("PDF generation request received. Resume text length:", resumeText?.length);
    if (resumeText) {
      console.log("Resume text (first 200 chars):", resumeText.substring(0, 200).replace(/\n/g, "\\n"));
    }

    if (!resumeText || resumeText.trim().length === 0) {
      console.error("No resume text provided or text is empty");
      return NextResponse.json(
        { error: "No resume text provided" },
        { status: 400 }
      );
    }

    const textContent = String(resumeText);
    if (textContent.length < 10) {
      console.error("Resume text is too short:", textContent);
      return NextResponse.json(
        { error: "Resume text is too short to generate PDF" },
        { status: 400 }
      );
    }

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      try {
        const margins = { top: 50, bottom: 50, left: 50, right: 50 };

        const doc = new PDFDocument({
          size: "A4",
          margins,
          compress: true,
          info: {
            Title: "Optimized Resume",
            Author: "ATS Resume Analyzer",
            Subject: "ATS-Optimized Resume",
            Keywords: "resume, ATS, optimized",
            Creator: "ATS Resume Analyzer",
            Producer: "PDFKit",
          },
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on("end", () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on("error", (err: Error) => {
          reject(err);
        });

        // Parse the resume text into sections
        const { nameLines, sections } = parseResumeText(resumeText);
        console.log("Parsed result - nameLines count:", nameLines.length, "sections count:", sections.length);

        // Layout constants
        const pageWidth = 595.28;
        const contentWidth = pageWidth - margins.left - margins.right;
        const headerFontSize = 13;
        const bodyFontSize = 11;
        const lineGap = 4;
        const maxContentY = 842 - margins.bottom - 30;

        // Fallback: If no sections detected, render raw text
        if (sections.length === 0) {
          console.log("WARNING: No sections detected! Rendering raw text fallback.");
          
          doc.fontSize(16).font("Helvetica-Bold").text("RESUME CONTENT", { align: "center" });
          doc.moveDown();
          
          doc.fontSize(11).font("Helvetica").fillColor("#333333");
          
          const paragraphs = textContent.split(/\n\n+/);
          for (const para of paragraphs) {
            if (doc.y > maxContentY) {
              doc.addPage();
              doc.fontSize(11).font("Helvetica").fillColor("#333333");
            }
            doc.text(para.trim(), { lineGap: 4 });
            doc.moveDown(0.5);
          }
          
          doc.end();
          console.log("doc.end() called successfully - fallback mode");
        } else {
          // --- Section-based rendering ---
          
          // Render candidate name / contact header
          if (nameLines.length > 0) {
            doc
              .fontSize(18)
              .font("Helvetica-Bold")
              .fillColor("#111111")
              .text(nameLines[0], { align: "center" });

            if (nameLines.length > 1) {
              doc
                .fontSize(10)
                .font("Helvetica")
                .fillColor("#444444");

              for (let i = 1; i < nameLines.length; i++) {
                doc.text(nameLines[i], { align: "center", lineGap: 2 });
              }
            }

            doc.moveDown(0.5);
            const dividerY = doc.y;
            doc
              .moveTo(margins.left, dividerY)
              .lineTo(margins.left + contentWidth, dividerY)
              .strokeColor("#999999")
              .lineWidth(0.75)
              .stroke();
            doc.moveDown(0.8);
          }

          // Render each section
          for (const section of sections) {
            if (doc.y > maxContentY) {
              doc.addPage();
            }

            doc
              .fontSize(headerFontSize)
              .font("Helvetica-Bold")
              .fillColor("#1a1a1a")
              .text(section.title, { align: "left", lineGap: 2 });

            const underlineY = doc.y;
            doc
              .moveTo(margins.left, underlineY)
              .lineTo(margins.left + contentWidth, underlineY)
              .strokeColor("#333333")
              .lineWidth(0.5)
              .stroke();

            doc.moveDown(0.4);

            doc
              .fontSize(bodyFontSize)
              .font("Helvetica")
              .fillColor("#333333");

            for (const line of section.content) {
              if (doc.y > maxContentY) {
                doc.addPage();
                doc
                  .fontSize(bodyFontSize)
                  .font("Helvetica")
                  .fillColor("#333333");
              }

              if (
                line.startsWith("•") ||
                line.startsWith("-") ||
                line.startsWith("*")
              ) {
                const bulletContent = line.replace(/^[•\-\*]\s*/, "");
                doc.text("• " + bulletContent, {
                  indent: 10,
                  lineGap: lineGap,
                });
              } else if (/^\d+\.\s/.test(line)) {
                doc.text(line, {
                  indent: 10,
                  lineGap: lineGap,
                });
              } else if (
                /^[A-Z][a-zA-Z\s]{2,30}:\s/.test(line) &&
                line.length < 80
              ) {
                doc.font("Helvetica-Bold").text(line, {
                  lineGap: lineGap,
                });
                doc.font("Helvetica");
              } else {
                doc.text(line, {
                  lineGap: lineGap,
                });
              }
            }

            doc.moveDown(0.8);
          }

          doc.end();
          console.log("doc.end() called successfully - section mode");
        }
      } catch (err: unknown) {
        console.error("Internal PDFKit error caught:", err);
        reject(err);
      }
    });

    console.log("Final pdfBuffer collected. Byte length:", pdfBuffer.length);
    if (pdfBuffer.length < 500) {
      console.warn("WARNING: PDF buffer is suspiciously small!");
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=optimized-resume.pdf",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Generate PDF route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating PDF" },
      { status: 500 }
    );
  }
}
