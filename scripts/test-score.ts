import { scoreResumeAgainstPack } from "../src/lib/keyword-packs/score";
import { ALL_PACKS } from "../src/lib/keyword-packs/data";
import assert from "assert";

console.log("Running ATS pack tests...");

const pack = ALL_PACKS.find(p => p.id === "amazon-swe-new-grad");
if (!pack) throw new Error("Pack not found");

// Test 1: Matcher word boundaries
const javaInsideJavascriptResume = "I love programming in javascript and c#";
const result1 = scoreResumeAgainstPack(javaInsideJavascriptResume, pack);
assert(!result1.matchedHardSkills.includes("Java"), "java should not match inside javascript");

const javascriptResume = "I am skilled in javascript and nothing else";
const resultJavascript = scoreResumeAgainstPack(javascriptResume, pack);
// No javascript skill in amazon pack by default (it's in niceToHave, let's test a pack with Node.js)
assert(!resultJavascript.matchedNiceToHave.includes("Node.js"), "should not match node");

const cppResume = "I know c++ and python.";
const resultCpp = scoreResumeAgainstPack(cppResume, pack);
assert(resultCpp.matchedHardSkills.includes("C++"), "c++ should match");
assert(resultCpp.matchedHardSkills.includes("Python"), "python should match");

const nodejsResume = "I am good at node.js.";
const resultNode = scoreResumeAgainstPack(nodejsResume, pack);
assert(resultNode.matchedNiceToHave.includes("Node.js"), "node.js should match");

const multiWordResume = "I know data structures and algorithms.";
const resultMulti = scoreResumeAgainstPack(multiWordResume, pack);
assert(resultMulti.matchedHardSkills.includes("Data Structures"), "data structures should match");
assert(resultMulti.matchedHardSkills.includes("Algorithms"), "algorithms should match");

// Test 2: Scoring differences
const strongResume = `
  Jane Doe
  jane.doe@example.com
  
  Experience
  Software Engineer Intern
  Architected and built a distributed web application using Java, Python, and AWS.
  Owned the project from end-to-end, and delivered results early.
  Simplified the architecture, ensuring high scalability.
  
  Education
  BS Computer Science
  
  Skills
  Java, Python, AWS, Data Structures, Algorithms, Git, Object-Oriented Design, Linux, Databases
`;

const weakResume = `
  John Doe
  No Email Here
  
  I am familiar with programming and helped with a project.
  I have basic knowledge of coding and worked on some things.
`;

const strongResult = scoreResumeAgainstPack(strongResume, pack);
const weakResult = scoreResumeAgainstPack(weakResume, pack);

console.log("Strong resume score:", strongResult.overall, "Red flags penalty:", strongResult.redFlagPenalty);
console.log("Weak resume score:", weakResult.overall, "Red flags penalty:", weakResult.redFlagPenalty);

assert(strongResult.overall > weakResult.overall, "Strong resume should score higher");
assert(weakResult.redFlagPenalty > 0, "Weak resume should have red flag penalty");
assert(weakResult.redFlagsFound.length >= 3, "Weak resume should match multiple red flags");
assert(weakResult.formattingChecklist.some(c => c.severity === "warn"), "Weak resume should have formatting warnings (no email/headers)");

console.log("All tests passed!");
