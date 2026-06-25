"use client";

import { useEffect } from "react";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { getResumeTipTapExtensions } from "@/lib/resume/tiptapExtensions";
import { ResumeTipTapToolbar } from "./ResumeTipTapToolbar";

import "./resume-tiptap.css";

interface ResumeTipTapEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  hint?: string;
  minHeight?: string;
  /** Optional max height for the editor container; defaults to 320px */
  maxHeight?: string;
}

export function ResumeTipTapEditor({
  content,
  onChange,
  placeholder,
  hint,
  minHeight = "160px",
  maxHeight = "320px",
}: ResumeTipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: getResumeTipTapExtensions({ placeholder }),
    content,
    editorProps: {
      attributes: {
        class: "resume-tiptap-editor outline-none text-sm leading-relaxed text-zinc-800 dark:text-zinc-200",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ResumeTipTapToolbar editor={editor} showLists />
      </div>
        <div
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-y-auto"
        style={{ minHeight, maxHeight }}
      >
        <div className="p-6">
          <EditorContent editor={editor} />
        </div>
      </div>
      {hint && <p className="text-[10px] text-zinc-400 font-medium">{hint}</p>}
    </div>
  );
}

interface ResumeTipTapInlineEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
  /** Optional max height for the inline editor container; defaults to 120px */
  maxHeight?: string;
}

export function ResumeTipTapInlineEditor({
  content,
  onChange,
  placeholder,
  maxHeight = "120px",
}: ResumeTipTapInlineEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: getResumeTipTapExtensions({ placeholder, inline: true }),
    content,
    editorProps: {
      attributes: {
        class:
          "resume-tiptap-inline outline-none text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 min-h-[40px]",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content);
    if (current !== incoming) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ResumeTipTapToolbar editor={editor} showLists={false} />
      </div>
        <div className="overflow-y-auto" style={{ maxHeight }}>
          <EditorContent editor={editor} />
        </div>
    </div>
  );
}
