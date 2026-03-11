// Extract keywords from text (simple but effective)
export function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/);

  // Remove very small/common words
  const stopWords = new Set([
    "the", "and", "for", "with", "you", "your", "are", "this", "that",
    "from", "have", "has", "had", "was", "were", "will", "shall", "can",
    "may", "might", "about", "into", "onto", "than", "then"
  ]);

  return [...new Set(words.filter(w => w.length > 2 && !stopWords.has(w)))];
}
