// export function calculateATSScore(text: string) {
//   let score = 0;

//   if (text.length > 300) score += 20;
//   if (text.includes("project")) score += 20;
//   if (text.includes("skill")) score += 20;
//   if (text.includes("experience")) score += 20;

//   return {
//     score,
//     verdict:
//       score > 70 ? "ATS Ready" : score > 40 ? "Needs Improvement" : "Poor",
//   };
// }


import { matchJobDescription } from "./jdMatcher";

function checkSections(text: string) {
  const sections = ["education", "project", "skill", "experience"];
  let found = 0;

  sections.forEach((section) => {
    if (text.toLowerCase().includes(section)) found++;
  });

  return Math.round((found / sections.length) * 100);
}

export function calculateATSScore(
  resumeText: string,
  jdText?: string
) {
  const sectionScore = checkSections(resumeText);

  let keywordScore = 50;
  let missingKeywords: string[] = [];
  let matchedKeywords: string[] = [];

  if (jdText && jdText.length > 20) {
    const jdMatch = matchJobDescription(resumeText, jdText);
    keywordScore = jdMatch.matchPercent;
    missingKeywords = jdMatch.missingKeywords;
    matchedKeywords = jdMatch.matchedKeywords;
  }

  // Final ATS Score formula
  const finalScore = Math.round(
    keywordScore * 0.6 + sectionScore * 0.4
  );

  let verdict = "Poor";
  if (finalScore > 75) verdict = "ATS Ready";
  else if (finalScore > 50) verdict = "Average";
  else verdict = "Needs Improvement";

  return {
    score: finalScore,
    verdict,
    sectionScore,
    keywordScore,
    matchedKeywords,
    missingKeywords,
  };
}
