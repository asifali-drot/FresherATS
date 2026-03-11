export async function parsePdf(fileBuffer: Buffer): Promise<string> {
  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text ?? "";
  } catch (error) {
    console.error("PDF parse error:", error);
    return "";
  }
}
