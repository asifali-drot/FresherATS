import { defineType, defineArrayMember } from "sanity";

/**
 * This is the schema definition for the rich text (Portable Text) used by
 * multiple document types (blog, guide, tip).
 * It includes support for standard blocks, images, code snippets, and raw HTML.
 */
export const blockContent = defineType({
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    defineArrayMember({
      title: "Block",
      type: "block",
      // Styles let you set what your user can mark up blocks with. These
      // correspond with HTML tags, but you can set any title or value
      // you want and decide how you want to edit it where you render it.
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H1", value: "h1" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [{ title: "Bullet", value: "bullet" }, { title: "Number", value: "number" }],
      // Marks let you mark up inline text in the block editor.
      marks: {
        // Decorators usually represent a single property – e.g. a line
        // through text or making it italic.
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" },
          { title: "Underline", value: "underline" },
          { title: "Strike", value: "strike-through" },
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
              },
            ],
          },
        ],
      },
    }),
    // You can add additional types here. Note that you can't use
    // primitive types such as 'string' and 'number' in the same array
    // as a block type.
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Important for SEO and accessibility.",
        },
      ],
    }),
    defineArrayMember({
      type: "code",
      options: {
        language: "javascript",
        languageAlternatives: [
          { title: "JavaScript", value: "javascript" },
          { title: "TypeScript", value: "typescript" },
          { title: "HTML", value: "html" },
          { title: "CSS", value: "css" },
          { title: "Python", value: "python" },
          { title: "Bash", value: "sh" },
          { title: "JSON", value: "json" },
          { title: "Markdown", value: "markdown" },
        ],
        withFilename: true,
      },
    }),
    defineArrayMember({
      type: "object",
      name: "htmlEmbed",
      title: "HTML Embed",
      fields: [
        {
          name: "html",
          title: "Raw HTML",
          type: "text",
          rows: 10,
          description: "Paste your raw HTML here. It will be rendered directly on the page.",
        },
      ],
      preview: {
        select: { html: "html" },
        prepare({ html }: { html?: string }) {
          return {
            title: "HTML Embed",
            subtitle: html ? html.slice(0, 80) + "…" : "Empty",
          };
        },
      },
    }),
  ],
});
