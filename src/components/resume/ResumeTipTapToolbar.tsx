"use client";

import { Bold, Highlighter, Italic, List } from "lucide-react";
import type { Editor } from "@tiptap/react";

const btnClass =
  "p-1.5 px-2 hover:bg-white dark:hover:bg-zinc-800 rounded-md flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed";

export function ResumeTipTapToolbar({
  editor,
  showLists = true,
}: {
  editor: Editor | null;
  showLists?: boolean;
}) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${btnClass} ${editor.isActive("bold") ? "bg-white dark:bg-zinc-800 text-blue-600" : ""}`}
        title="Bold (Ctrl+B)"
      >
        <span className="font-bold">B</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${btnClass} ${editor.isActive("italic") ? "bg-white dark:bg-zinc-800 text-blue-600" : ""}`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`${btnClass} ${editor.isActive("highlight") ? "bg-white dark:bg-zinc-800 text-blue-600" : ""}`}
        title="Highlight"
      >
        <Highlighter className="h-3 w-3" />
      </button>
      {showLists && (
        <>
          <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${btnClass} ${editor.isActive("bulletList") ? "bg-white dark:bg-zinc-800 text-blue-600" : ""}`}
            title="Bullet list"
          >
            <List className="h-3 w-3" />
            Bullet
          </button>
        </>
      )}
    </div>
  );
}
