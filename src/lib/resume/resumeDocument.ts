import type { JSONContent } from "@tiptap/core";
import { generateHTML, generateJSON } from "@tiptap/html";
import { parseResumeText, type ParsedSection, looksLikePersonName, isContactLine, detectKnownSection } from "./resumeUtils";
import { getResumeTipTapExtensions } from "./tiptapExtensions";

export const RESUME_DOCUMENT_VERSION = 1 as const;

export interface ResumeSectionDocument {
  title: string;
  content: JSONContent;
}

export interface ResumeDocumentJson {
  version: typeof RESUME_DOCUMENT_VERSION;
  nameLines: JSONContent[];
  sections: ResumeSectionDocument[];
}

const blockExtensions = getResumeTipTapExtensions();
const inlineExtensions = getResumeTipTapExtensions({ inline: true });

function emptyDoc(): JSONContent {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

function inlineMarkdownToHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/==(.*?)==/g, "<mark>$1</mark>");
}

function plainLinesToHtml(lines: string[]): string {
  return lines
    .map((line) => {
      const bulletMatch = line.match(/^[•\-\*]\s(.*)$/);
      if (bulletMatch) {
        const text = bulletMatch[1].trim();
        if (!text) return ""; // Skip empty bullets
        return `<ul><li><p>${inlineMarkdownToHtml(text)}</p></li></ul>`;
      }
      if (!line.trim()) return "<p><br></p>";
      return `<p>${inlineMarkdownToHtml(line)}</p>`;
    })
    .join("");
}

function plainLineToDoc(text: string): JSONContent {
  const html = `<p>${inlineMarkdownToHtml(text) || "<br>"}</p>`;
  return generateJSON(html, inlineExtensions);
}

function plainLinesToDoc(lines: string[]): JSONContent {
  if (lines.length === 0) return emptyDoc();
  const html = plainLinesToHtml(lines);
  return generateJSON(html, blockExtensions);
}

function serializeInline(nodes?: JSONContent[]): string {
  if (!nodes?.length) return "";

  return nodes
    .map((node) => {
      if (node.type === "hardBreak") return "";
      if (node.type !== "text" || !node.text) return "";

      let text = node.text;
      const marks = node.marks ?? [];
      if (marks.some((m) => m.type === "bold")) text = `**${text}**`;
      if (marks.some((m) => m.type === "italic")) text = `_${text}_`;
      if (marks.some((m) => m.type === "highlight")) text = `==${text}==`;
      return text;
    })
    .join("");
}

export function tiptapDocToPlainLines(doc: JSONContent): string[] {
  const lines: string[] = [];
  const blocks = doc.content ?? [];

  for (const block of blocks) {
    if (block.type === "paragraph") {
      const text = serializeInline(block.content);
      if (text) lines.push(text);
    } else if (block.type === "bulletList") {
      for (const item of block.content ?? []) {
        if (item.type !== "listItem") continue;
        const paragraph = item.content?.find((n) => n.type === "paragraph");
        const text = serializeInline(paragraph?.content).trim();
        if (text) {
          lines.push(`• ${text}`);
        }
      }
    }
  }

  return lines;
}

export function tiptapDocToPlainText(doc: JSONContent): string {
  const blocks = doc.content ?? [];
  if (blocks.length === 1 && blocks[0].type === "paragraph") {
    return serializeInline(blocks[0].content);
  }
  return tiptapDocToPlainLines(doc).join("\n");
}

export function resumeDocumentToText(doc: ResumeDocumentJson): string {
  const nameLines = doc.nameLines.map((lineDoc) => tiptapDocToPlainText(lineDoc)).filter(Boolean);
  const sectionBlocks = doc.sections.flatMap((section) => {
    const contentLines = tiptapDocToPlainLines(section.content);
    // Use a placeholder title when empty (user is mid-rename) so parseResumeText
    // still treats this as its own section and doesn't merge content into the previous one.
    const titleLine = section.title.trim() || "NEW SECTION";
    return [titleLine, ...contentLines, ""];
  });

  return [...nameLines, "", ...sectionBlocks].join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

export function parsedResumeToDocument(
  nameLines: string[],
  sections: ParsedSection[]
): ResumeDocumentJson {
  return {
    version: RESUME_DOCUMENT_VERSION,
    nameLines: nameLines.length > 0 ? nameLines.map(plainLineToDoc) : [emptyDoc()],
    sections: sections.map((section) => ({
      title: section.title,
      content: plainLinesToDoc(section.content),
    })),
  };
}

export function textToResumeDocument(text: string): ResumeDocumentJson {
  const { nameLines, sections } = parseResumeText(text);
  return parsedResumeToDocument(nameLines, sections);
}

export function resumeDocumentToParsed(doc: ResumeDocumentJson): {
  nameLines: string[];
  sections: ParsedSection[];
} {
  return {
    nameLines: doc.nameLines.map((lineDoc) => tiptapDocToPlainText(lineDoc)).filter(Boolean),
    sections: doc.sections.map((section) => ({
      title: section.title,
      content: tiptapDocToPlainLines(section.content),
    })),
  };
}

export function isResumeDocumentJson(value: unknown): value is ResumeDocumentJson {
  if (!value || typeof value !== "object") return false;
  const v = value as ResumeDocumentJson;
  return v.version === RESUME_DOCUMENT_VERSION && Array.isArray(v.nameLines) && Array.isArray(v.sections);
}

/**
 * Sanitizes a stored ResumeDocumentJson by absorbing any leading CONTACT /
 * PERSONAL INFORMATION section into nameLines.  This fixes documents that were
 * created before the parser was updated — the AI used to put personal details
 * under a "CONTACT" heading, which ended up as a regular section.
 */
export function sanitizeResumeDocument(doc: ResumeDocumentJson): ResumeDocumentJson {
  const PERSONAL_SECTION_TITLES = new Set([
    "CONTACT",
    "CONTACT INFORMATION",
    "CONTACT INFO",
    "PERSONAL INFORMATION",
    "PERSONAL DETAILS",
    "PERSONAL INFO",
    "PERSONAL",
    "HEADER",
  ]);

  let workingDoc = doc;

  // Find a personal/contact section among the first two sections
  const earlyPersonalIdx = workingDoc.sections.findIndex(
    (s, i) => i <= 1 && PERSONAL_SECTION_TITLES.has(s.title.trim().toUpperCase())
  );

  if (earlyPersonalIdx !== -1) {
    const personalSection = workingDoc.sections[earlyPersonalIdx];
    const contactLines = tiptapDocToPlainLines(personalSection.content)
      .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);

    const existingNameText = workingDoc.nameLines.map(tiptapDocToPlainText).filter(Boolean);
    const mergedTextLines = [...existingNameText];
    for (const line of contactLines) {
      if (!mergedTextLines.includes(line)) {
        mergedTextLines.push(line);
      }
    }

    const newSections = [...workingDoc.sections];
    newSections.splice(earlyPersonalIdx, 1);
    workingDoc = {
      ...workingDoc,
      nameLines: mergedTextLines.length > 0 ? mergedTextLines.map(plainLineToDoc) : workingDoc.nameLines,
      sections: newSections,
    };
  }

  // Absorb mis-parsed name header sections (e.g. title "JOHN DOE" with contact lines as content)
  if (workingDoc.sections.length > 0) {
    const first = workingDoc.sections[0];
    const titleIsName = looksLikePersonName(first.title);
    const titleIsUnknownCaps =
      !detectKnownSection(first.title) &&
      /^[A-Z][A-Z\s.'\-]{1,58}[A-Za-z.]$/.test(first.title.trim());

    const contentLines = tiptapDocToPlainLines(first.content)
      .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);

    const contentLooksLikeContact =
      contentLines.length === 0 ||
      contentLines.every(
        (line) => isContactLine(line) || (line.length < 80 && !detectKnownSection(line))
      );

    if (titleIsName || (titleIsUnknownCaps && contentLooksLikeContact)) {
      const existingNameText = workingDoc.nameLines.map(tiptapDocToPlainText).filter(Boolean);
      const mergedTextLines = [...existingNameText];
      for (const line of [first.title.trim(), ...contentLines]) {
        if (line && !mergedTextLines.includes(line)) {
          mergedTextLines.push(line);
        }
      }

      const newSections = [...workingDoc.sections];
      newSections.shift();
      workingDoc = {
        ...workingDoc,
        nameLines: mergedTextLines.map(plainLineToDoc),
        sections: newSections,
      };
    }
  }

  return workingDoc;
}

/** HTML preview helper for debugging — not used in PDF path */
export function tiptapDocToHtml(doc: JSONContent): string {
  return generateHTML(doc, blockExtensions);
}
