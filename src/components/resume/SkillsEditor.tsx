"use client";

import { useEffect, useState } from "react";
import type { JSONContent } from "@tiptap/core";
import { tiptapDocToPlainLines } from "@/lib/resume/resumeDocument";

/**
 * Chip-based editor for the SKILLS section.
 * It receives a TipTap bulletList document and emits a new document
 * whenever the list of skills changes.
 */
export function SkillsEditor({
  content,
  onChange,
  placeholder = "Add skills (comma separated)...",
  maxHeight = "360px",
}: {
  content: JSONContent;
  onChange: (doc: JSONContent) => void;
  placeholder?: string;
  maxHeight?: string;
}) {
  // Convert the incoming TipTap doc to an array of skill strings.
  const initialSkills = tiptapDocToPlainLines(content)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);

  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [input, setInput] = useState<string>("");

  // Whenever the skills array changes, rebuild a bulletList TipTap doc and notify parent.
  useEffect(() => {
    const newDoc: JSONContent =
      skills.length === 0
        ? { type: "doc", content: [{ type: "paragraph" }] }
        : {
            type: "doc",
            content: [
              {
                type: "bulletList",
                content: skills.map((skill) => ({
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: skill }],
                    },
                  ],
                })),
              },
            ],
          };
    onChange(newDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Split on commas as the user types.
    if (val.includes(",")) {
      const parts = val.split(",");
      // All but the last part are complete skills.
      parts.slice(0, -1).forEach(addSkill);
      setInput(parts[parts.length - 1]);
    } else {
      setInput(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addSkill(input);
      setInput("");
    } else if (e.key === "Backspace" && !input && skills.length) {
      // Remove last skill on backspace when input is empty.
      e.preventDefault();
      setSkills((prev) => prev.slice(0, -1));
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex flex-wrap gap-2 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-y-auto"
        style={{ maxHeight }}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-900/50"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-zinc-800 dark:text-zinc-200"
        />
      </div>
    </div>
  );
}
