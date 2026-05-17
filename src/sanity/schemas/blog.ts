import { defineField, defineType } from "sanity";

export const blog = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: Rule => Rule.required().max(60),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: "metaTitle",
      title: "SEO Meta Title",
      type: "string",
      description: "Recommended length: 50–60 characters",
      validation: Rule => Rule.max(60)
    }),
    defineField({
      name: "metaDescription",
      title: "SEO Meta Description",
      type: "text",
      rows: 3,
      description: "Recommended length: 140–160 characters",
      validation: Rule => Rule.max(160)
    }),
    defineField({
      name: "keywords",
      title: "SEO Keywords",
      type: "array",
      of: [{ type: "string" }]
    }),
    defineField({
      name: "mainImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility.',
        },
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3
    }),
    defineField({
      name: "body",
      title: "Blog Content",
      type: "blockContent",
    }),
    defineField({
      name: "publishedAt",
      title: "Publish Date",
      type: "datetime"
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string"
    }),
    defineField({
      name: "faqs",
      title: "Frequently Asked Questions",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", title: "Question", type: "string" },
            { name: "answer", title: "Answer", type: "text", rows: 4 }
          ]
        }
      ]
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      publishedAt: 'publishedAt',
      media: 'mainImage',
      slug: 'slug',
    },
    prepare({ title, author, publishedAt, media, slug }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Unpublished';
      const byLine = author ? `By ${author}` : '';
      return {
        title: title || 'Untitled Post',
        subtitle: [byLine, date, slug?.current ? `/${slug.current}` : '']
          .filter(Boolean)
          .join(' · '),
        media,
      };
    },
  },
});
