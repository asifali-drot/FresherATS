import type { JSONContent } from "@tiptap/core";
import { generateHTML, generateJSON } from "@tiptap/html";
import { parseResumeText, type ParsedSection } from "./resumeUtils";
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
        return `<ul><li><p>${inlineMarkdownToHtml(bulletMatch[1]) || "<br>"}</p></li></ul>`;
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
        const text = serializeInline(paragraph?.content);
        lines.push(`• ${text}`.trimEnd());
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
    return [section.title, ...contentLines, ""];
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

/** HTML preview helper for debugging — not used in PDF path */
export function tiptapDocToHtml(doc: JSONContent): string {
  return generateHTML(doc, blockExtensions);
}
