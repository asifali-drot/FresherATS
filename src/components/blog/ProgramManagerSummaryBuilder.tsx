"use client";

import { useState, useCallback } from "react";

/* ─── Default values ──────────────────────────────────────────────────────── */
const DEFAULTS = {
  level: "Strategic",
  years: "8",
  spec: "Agile software development and product delivery programs",
  sk1: "Stakeholder Mgmt",
  sk2: "Program Roadmaps",
  sk3: "Agile Governance",
  what: "a $12M digital overhaul",
  res: "delivered 15% under budget",
};

/* ─── Option lists ────────────────────────────────────────────────────────── */
const LEVEL_OPTIONS = [
  { value: "Strategic", label: "Strategic (Mid-Senior)" },
  { value: "Results-oriented", label: "Results-oriented (Early)" },
  { value: "Senior", label: "Senior" },
  { value: "Executive", label: "Executive" },
];

const YEAR_OPTIONS = [
  { value: "5", label: "5 years" },
  { value: "8", label: "8 years" },
  { value: "12", label: "12 years" },
  { value: "15+", label: "15+ years" },
];

const SPEC_OPTIONS = [
  { value: "Agile software development and product delivery programs", label: "Agile Software Development" },
  { value: "enterprise-wide digital transformation initiatives", label: "Digital Transformation" },
  { value: "complex cloud migration and infrastructure modernizations", label: "Cloud & Infrastructure" },
  { value: "cross-functional strategic planning and PMO operations", label: "Strategic Planning / PMO" },
  { value: "large-scale ERP implementations and integrations", label: "ERP Implementation" },
];

const SK1_OPTIONS = ["Stakeholder Mgmt", "Risk Mitigation", "Budget Forecasting"];
const SK2_OPTIONS = ["Program Roadmaps", "Vendor Mgmt", "OKR Alignment"];
const SK3_OPTIONS = ["Agile Governance", "Change Mgmt", "KPI Reporting"];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function buildSummaryText(
  level: string, years: string, spec: string,
  sk1: string, sk2: string, sk3: string,
  what: string, res: string,
) {
  return `${level} Program Manager with ${years} years of experience delivering ${spec}. Expertise in ${sk1}, ${sk2}, and ${sk3}. Most recently spearheaded ${what || "major initiative"}, which was ${res || "on schedule"}.`;
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function StepCard({ color, label, hint, children }: { color: string; label: string; hint: string; children: React.ReactNode }) {
  const palette: Record<string, { bg: string; border: string; text: string }> = {
    blue:   { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8" },
    green:  { bg: "#f0fdf4", border: "#10b981", text: "#166534" },
    amber:  { bg: "#fffbeb", border: "#f59e0b", text: "#92400e" },
    purple: { bg: "#f5f3ff", border: "#8b5cf6", text: "#5b21b6" },
  };
  const p = palette[color];
  return (
    <div style={{
      background: p.bg, borderLeft: `4px solid ${p.border}`,
      borderRadius: 10, padding: "14px 16px", marginBottom: 12,
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: p.text, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", marginBottom: 12 }}>{hint}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1",
  fontSize: 13, fontFamily: "inherit", color: "#1e293b", background: "#fff",
  outline: "none", boxSizing: "border-box",
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function ProgramManagerSummaryBuilder() {
  const [level, setLevel] = useState(DEFAULTS.level);
  const [years, setYears] = useState(DEFAULTS.years);
  const [spec,  setSpec]  = useState(DEFAULTS.spec);
  const [sk1,   setSk1]   = useState(DEFAULTS.sk1);
  const [sk2,   setSk2]   = useState(DEFAULTS.sk2);
  const [sk3,   setSk3]   = useState(DEFAULTS.sk3);
  const [what,  setWhat]  = useState(DEFAULTS.what);
  const [res,   setRes]   = useState(DEFAULTS.res);
  const [copied, setCopied] = useState(false);

  const summaryText = buildSummaryText(level, years, spec, sk1, sk2, sk3, what, res);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text manually
    }
  }, [summaryText]);

  const handleReset = () => {
    setLevel(DEFAULTS.level); setYears(DEFAULTS.years); setSpec(DEFAULTS.spec);
    setSk1(DEFAULTS.sk1); setSk2(DEFAULTS.sk2); setSk3(DEFAULTS.sk3);
    setWhat(DEFAULTS.what); setRes(DEFAULTS.res);
  };

  return (
    <div style={{
      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
      boxSizing: "border-box", background: "#f8fafc", padding: "32px 16px",
      margin: "32px 0",
    }}>
      <div style={{
        maxWidth: 640, margin: "0 auto", background: "#ffffff",
        borderRadius: 16, border: "1px solid #e2e8f0",
        padding: 28, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: "#4c1d95",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}>✍️</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "#94a3b8" }}>
              Interactive builder
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", lineHeight: 1.25, marginTop: 3 }}>
              Program Manager Summary Formula
            </h3>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 22px", lineHeight: 1.5 }}>
          Build a high-impact summary that satisfies both ATS scanners and hiring managers.
        </p>

        {/* ── Step 1: Experience ── */}
        <StepCard color="blue" label="Step 1: Experience" hint="Establish seniority immediately.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Seniority Level">
              <select value={level} onChange={e => setLevel(e.target.value)} style={inputStyle}>
                {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Years of Exp.">
              <select value={years} onChange={e => setYears(e.target.value)} style={inputStyle}>
                {YEAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
        </StepCard>

        {/* ── Step 2: Specialization ── */}
        <StepCard color="green" label="Step 2: Specialization" hint="What domain do you own?">
          <Field label="Specialization Area">
            <select value={spec} onChange={e => setSpec(e.target.value)} style={inputStyle}>
              {SPEC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </StepCard>

        {/* ── Step 3: Hard Skills ── */}
        <StepCard color="amber" label="Step 3: Hard Skills" hint="Choose 3 keywords for ATS match.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Skill 1">
              <select value={sk1} onChange={e => setSk1(e.target.value)} style={inputStyle}>
                {SK1_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Skill 2">
              <select value={sk2} onChange={e => setSk2(e.target.value)} style={inputStyle}>
                {SK2_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Skill 3">
              <select value={sk3} onChange={e => setSk3(e.target.value)} style={inputStyle}>
                {SK3_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        </StepCard>

        {/* ── Step 4: Big Win ── */}
        <StepCard color="purple" label="Step 4: Big Win" hint="Add a quantified achievement.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Initiative / Project">
              <input
                type="text" value={what} placeholder="e.g., $10M cloud migration"
                onChange={e => setWhat(e.target.value)} style={inputStyle}
              />
            </Field>
            <Field label="Outcome / Result">
              <input
                type="text" value={res} placeholder="e.g., 20% under budget"
                onChange={e => setRes(e.target.value)} style={inputStyle}
              />
            </Field>
          </div>
        </StepCard>

        {/* ── Live Preview ── */}
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", margin: "24px 0 8px" }}>
          Live Preview
        </div>
        <div style={{
          background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: 12,
          padding: 20, fontSize: 14, lineHeight: 1.8, color: "#1e293b", minHeight: 80,
        }}>
          <strong style={{ color: "#1d4ed8" }}>{level} Program Manager with {years} years</strong>
          {" "}of experience delivering{" "}
          <span style={{ color: "#166534", fontWeight: 600 }}>{spec}</span>.
          {" "}Expertise in{" "}
          <span style={{ color: "#92400e", fontWeight: 600 }}>{sk1}, {sk2}, and {sk3}</span>.
          {" "}Most recently spearheaded{" "}
          <span style={{ color: "#5b21b6", fontWeight: 600 }}>
            {what || "major initiative"}, which was {res || "on schedule"}
          </span>.
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: "pointer", border: "none",
              background: copied ? "#16a34a" : "#1e293b",
              color: "#fff", transition: "background 0.2s",
              fontFamily: "inherit",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Summary"}
          </button>
          <button
            onClick={handleReset}
            style={{
              flex: 1, padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff",
              color: "#1e293b", transition: "all 0.2s", fontFamily: "inherit",
            }}
          >
            Reset
          </button>
        </div>

        {/* ── Pro Tip ── */}
        <div style={{
          marginTop: 20, borderRadius: 10, padding: 14,
          background: "#eff6ff", border: "1px solid #bfdbfe",
          fontSize: 12, color: "#1d4ed8", lineHeight: 1.5,
        }}>
          <strong>Pro Tip:</strong> Pasting this into our free{" "}
          <strong>ATS Resume Checker</strong> will tell you exactly which keywords
          you still need to add for your target job description.
        </div>
      </div>
    </div>
  );
}
