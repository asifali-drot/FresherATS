import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/react";

export function getResumeTipTapExtensions(options?: { placeholder?: string; inline?: boolean }): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
      bulletList: options?.inline ? false : { keepMarks: true, keepAttributes: false },
      orderedList: false,
      listItem: options?.inline ? false : undefined,
      hardBreak: options?.inline ? false : undefined,
    }),
    Highlight.configure({ multicolor: false }),
    ...(options?.placeholder
      ? [
          Placeholder.configure({
            placeholder: options.placeholder,
            emptyEditorClass: "is-editor-empty",
          }),
        ]
      : []),
  ];
}
