import type { TocItem } from "@/components/blog/TableOfContents";

type PortableTextBlock = {
  _type: string;
  style?: string;
  children?: Array<{ _type?: string; text?: string }>;
};

function slugifyBase(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createSlugger() {
  const seen = new Map<string, number>();
  return {
    slug(value: string) {
      const base = slugifyBase(value) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base}-${count + 1}`;
    },
  };
}

export function extractToc(body: unknown): TocItem[] {
  if (!Array.isArray(body)) return [];
  const slugger = createSlugger();
  const out: TocItem[] = [];

  for (const node of body as PortableTextBlock[]) {
    if (!node || node._type !== "block") continue;
    const style = node.style ?? "";
    const level = style === "h2" ? 2 : style === "h3" ? 3 : style === "h4" ? 4 : null;
    if (!level) continue;

    const text = (node.children ?? [])
      .map((c) => (typeof c?.text === "string" ? c.text : ""))
      .join("")
      .trim();

    if (!text) continue;
    out.push({ id: slugger.slug(text), text, level });
  }

  return out;
}

