export type AtsSystem = 
  | "Workday" 
  | "Greenhouse" 
  | "Lever" 
  | "Taleo" 
  | "iCIMS" 
  | "SuccessFactors" 
  | "Other";

export interface KeywordTerm {
  label: string;
  aliases: string[];
  weight?: number; // Default is 1
}

export interface ValuesSignal {
  label: string;
  description: string;
  cues: string[];
}

export interface SampleRewrite {
  before: string;
  after: string;
}

export interface CompanyKeywordPack {
  id: string;
  company: string;
  role: string;
  level: string;
  ats: AtsSystem;
  atsNotes: string[];
  hardSkills: KeywordTerm[];
  niceToHave: KeywordTerm[];
  valuesSignals: ValuesSignal[];
  actionVerbs: string[];
  newGradEmphasis: string[];
  redFlags: string[];
  sampleRewrites: SampleRewrite[];
  updatedAt: string;
}

export interface PackSummary {
  id: string;
  company: string;
  role: string;
  level: string;
}

export interface PackScanResult {
  packId: string;
  company: string;
  role: string;
  level: string;
  ats: AtsSystem;
  overall: number;
  hardScore: number;
  valuesScore: number;
  matchedHardSkills: string[];
  missingHardSkills: string[];
  matchedNiceToHave: string[];
  matchedValues: {
    label: string;
    description: string;
    hits: number;
  }[];
  missingValues: {
    label: string;
    description: string;
  }[];
  presentVerbs: string[];
  suggestedVerbs: string[];
  redFlagsFound: string[];
  redFlagPenalty: number;
  formattingChecklist: {
    text: string;
    severity: "info" | "warn";
  }[];
  newGradEmphasis: string[];
  sampleRewrites: SampleRewrite[];
}
