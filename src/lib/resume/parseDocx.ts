import mammoth from "mammoth";

export async function parseDocx(fileBuffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX parse error:", error);
    return "";
  }
}
