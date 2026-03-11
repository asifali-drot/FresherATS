import { extractKeywords } from "./keyword";

export function matchJobDescription(
  resumeText: string,
  jdText: string
) {
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jdText);

  const matched: string[] = [];
  const missing: string[] = [];

  jdKeywords.forEach((word) => {
    if (resumeKeywords.includes(word)) matched.push(word);
    else missing.push(word);
  });

  const matchPercent =
    jdKeywords.length === 0
      ? 0
      : Math.round((matched.length / jdKeywords.length) * 100);

  return {
    matchPercent,
    matchedKeywords: matched.slice(0, 20),
    missingKeywords: missing.slice(0, 20),
  };
}
