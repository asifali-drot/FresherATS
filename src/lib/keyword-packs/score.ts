import { CompanyKeywordPack, PackScanResult, KeywordTerm } from "./types";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function containsAlias(textLower: string, alias: string): boolean {
  const escaped = escapeRegExp(alias.toLowerCase());
  // Boundaries are alphanumeric
  const regex = new RegExp(`(^|[^a-z0-9])` + escaped + `([^a-z0-9]|$)`, 'i');
  return regex.test(textLower);
}

export function scoreResumeAgainstPack(resumeText: string, pack: CompanyKeywordPack): PackScanResult {
  const textLower = resumeText.toLowerCase();

  let sumWeightsMatched = 0;
  let sumWeightsAll = 0;
  const matchedHardSkills: string[] = [];
  const missingHardSkills: string[] = [];

  for (const skill of pack.hardSkills) {
    const weight = skill.weight ?? 1;
    sumWeightsAll += weight;

    const isMatch = skill.aliases.some(alias => containsAlias(textLower, alias));
    if (isMatch) {
      sumWeightsMatched += weight;
      matchedHardSkills.push(skill.label);
    } else {
      missingHardSkills.push(skill.label);
    }
  }

  const hardScore = sumWeightsAll > 0 ? Math.round(100 * sumWeightsMatched / sumWeightsAll) : 100;

  const matchedNiceToHave: string[] = [];
  for (const skill of pack.niceToHave) {
    const isMatch = skill.aliases.some(alias => containsAlias(textLower, alias));
    if (isMatch) {
      matchedNiceToHave.push(skill.label);
    }
  }

  const matchedValues: { label: string; description: string; hits: number }[] = [];
  const missingValues: { label: string; description: string }[] = [];
  let valuesHitsTotal = 0;

  for (const signal of pack.valuesSignals) {
    let hits = 0;
    for (const cue of signal.cues) {
      if (containsAlias(textLower, cue)) {
        hits++;
      }
    }
    if (hits > 0) {
      matchedValues.push({ label: signal.label, description: signal.description, hits });
      valuesHitsTotal++;
    } else {
      missingValues.push({ label: signal.label, description: signal.description });
    }
  }

  const totalValues = pack.valuesSignals.length;
  const valuesScore = totalValues > 0 ? Math.round(100 * valuesHitsTotal / totalValues) : 100;

  const presentVerbs: string[] = [];
  const suggestedVerbsPool: string[] = [];
  for (const verb of pack.actionVerbs) {
    if (containsAlias(textLower, verb)) {
      presentVerbs.push(verb);
    } else {
      suggestedVerbsPool.push(verb);
    }
  }
  const suggestedVerbs = suggestedVerbsPool.slice(0, 6);

  const redFlagsFound: string[] = [];
  for (const flag of pack.redFlags) {
    if (containsAlias(textLower, flag)) {
      redFlagsFound.push(flag);
    }
  }
  const redFlagPenalty = Math.min(redFlagsFound.length * 2, 10);

  let rawOverall = Math.round(0.7 * hardScore + 0.3 * valuesScore - redFlagPenalty);
  const overall = Math.max(0, Math.min(100, rawOverall));

  const formattingChecklist: { text: string; severity: "info" | "warn" }[] = [];
  for (const note of pack.atsNotes) {
    formattingChecklist.push({ text: note, severity: "info" });
  }

  // Text-only heuristics for warnings
  if (resumeText.includes("|")) {
    formattingChecklist.push({ text: "Avoid vertical pipes (|) which can confuse some parsers.", severity: "warn" });
  }
  
  // Basic email detection
  const emailRegex = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/i;
  if (!emailRegex.test(resumeText)) {
    formattingChecklist.push({ text: "Missing email address. ATS may not parse your contact info correctly.", severity: "warn" });
  }

  // Basic headers detection
  const headersPattern = /\b(experience|education|skills|projects)\b/i;
  if (!headersPattern.test(resumeText)) {
    formattingChecklist.push({ text: "Missing standard section headers (Experience, Education, Skills, or Projects).", severity: "warn" });
  }

  return {
    packId: pack.id,
    company: pack.company,
    role: pack.role,
    level: pack.level,
    ats: pack.ats,
    overall,
    hardScore,
    valuesScore,
    matchedHardSkills,
    missingHardSkills,
    matchedNiceToHave,
    matchedValues,
    missingValues,
    presentVerbs,
    suggestedVerbs,
    redFlagsFound,
    redFlagPenalty,
    formattingChecklist,
    newGradEmphasis: pack.newGradEmphasis,
    sampleRewrites: pack.sampleRewrites
  };
}
