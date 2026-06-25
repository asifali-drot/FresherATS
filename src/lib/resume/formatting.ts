import React from "react";

export type MarkupWrapper = "**" | "_" | "==";

export interface ToggleResult {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export function toggleWrap(
  text: string,
  start: number,
  end: number,
  wrapper: MarkupWrapper
): ToggleResult {
  const selected = text.substring(start, end);
  const wrapLen = wrapper.length;

  let replacement = "";
  if (selected.startsWith(wrapper) && selected.endsWith(wrapper) && selected.length >= wrapLen * 2) {
    replacement = selected.slice(wrapLen, -wrapLen);
  } else {
    replacement = `${wrapper}${selected}${wrapper}`;
  }

  const newText = text.substring(0, start) + replacement + text.substring(end);
  return {
    text: newText,
    selectionStart: start,
    selectionEnd: start + replacement.length,
  };
}

export function toggleBold(text: string, start: number, end: number): ToggleResult {
  return toggleWrap(text, start, end, "**");
}

export function toggleItalic(text: string, start: number, end: number): ToggleResult {
  return toggleWrap(text, start, end, "_");
}

export function toggleHighlight(text: string, start: number, end: number): ToggleResult {
  return toggleWrap(text, start, end, "==");
}

export function toggleBullet(text: string, start: number, end: number): ToggleResult {
  const selected = text.substring(start, end);
  let replacement = "";

  if (/^[•\-\*]\s/.test(selected)) {
    replacement = selected.replace(/^[•\-\*]\s/, "");
  } else {
    replacement = `• ${selected}`;
  }

  const newText = text.substring(0, start) + replacement + text.substring(end);
  return {
    text: newText,
    selectionStart: start,
    selectionEnd: start + replacement.length,
  };
}

export function normalizeResumeMarkup(text: string): string {
  if (!text) return text;

  let normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/?p[^>]*>/gi, "\n")
    .replace(/<\/?div[^>]*>/gi, "\n")
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em>([\s\S]*?)<\/em>/gi, "_$1_")
    .replace(/<i>([\s\S]*?)<\/i>/gi, "_$1_")
    .replace(/<mark>([\s\S]*?)<\/mark>/gi, "==$1==")
    .replace(/<[^>]+>/g, "");

  normalized = normalized
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return normalized.replace(/\n{3,}/g, "\n\n");
}

type InlineSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  highlight?: boolean;
};

function parseInlineSegments(line: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const pattern = /(\*\*.*?\*\*|_.*?_|==.*?==)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index) });
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      segments.push({ text: token.slice(2, -2), bold: true });
    } else if (token.startsWith("_") && token.endsWith("_")) {
      segments.push({ text: token.slice(1, -1), italic: true });
    } else if (token.startsWith("==") && token.endsWith("==")) {
      segments.push({ text: token.slice(2, -2), highlight: true });
    } else {
      segments.push({ text: token });
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text: line }];
}

function renderSegment(segment: InlineSegment, key: string): React.ReactNode {
  let className = "";
  if (segment.bold) className += " font-bold";
  if (segment.italic) className += " italic";
  if (segment.highlight) className += " bg-yellow-100 dark:bg-yellow-900/40 rounded-sm";

  if (!className) {
    return React.createElement("span", { key }, segment.text || "\u00a0");
  }

  return React.createElement(
    "span",
    { key, className: className.trim() },
    segment.text || "\u00a0"
  );
}

export function renderFormattedOverlay(text: string): React.ReactNode[] {
  if (!text) {
    return [React.createElement("span", { key: "empty" }, "\u00a0")];
  }

  const lines = text.split("\n");
  return lines.map((line, lineIndex) => {
    const segments = parseInlineSegments(line);
    const bulletMatch = line.match(/^([•\-\*]\s)(.*)$/);
    const prefix = bulletMatch ? bulletMatch[1] : "";
    const content = bulletMatch ? bulletMatch[2] : line;
    const contentSegments = bulletMatch ? parseInlineSegments(content) : segments;

    return React.createElement(
      "div",
      { key: `line-${lineIndex}`, className: "whitespace-pre-wrap break-words" },
      prefix
        ? [
            React.createElement("span", { key: "bullet", className: "text-blue-600 font-bold" }, prefix),
            ...contentSegments.map((seg, i) => renderSegment(seg, `seg-${lineIndex}-${i}`)),
          ]
        : segments.map((seg, i) => renderSegment(seg, `seg-${lineIndex}-${i}`))
    );
  });
}

export function insertTextAtSelection(
  text: string,
  start: number,
  end: number,
  insert: string
): ToggleResult {
  const newText = text.substring(0, start) + insert + text.substring(end);
  const cursor = start + insert.length;
  return {
    text: newText,
    selectionStart: cursor,
    selectionEnd: cursor,
  };
}
