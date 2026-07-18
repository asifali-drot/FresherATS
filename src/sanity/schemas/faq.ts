import { defineType, defineField } from 'sanity';

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'answer',
      type: 'text',
      validation: (r) => r.required().max(600),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Getting Started', value: 'getting-started' },
          { title: 'The Analysis', value: 'analysis' },
          { title: 'Features', value: 'features' },
          { title: 'Privacy & Data', value: 'privacy' },
          { title: 'Pricing', value: 'pricing' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'showOnHomepage',
      title: 'Include in homepage FAQ section',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'relatedPage',
      title: 'Related product page slug',
      type: 'string',
      description:
        'Optional. If this FAQ should also appear on a specific product page, enter its slug (e.g. "job-tracker", "linkedin-checker", "ai-cover-letter-generator").',
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Manual sort order within its category (lower = higher up).',
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: ['draft', 'published'], layout: 'radio' },
      initialValue: 'published',
      description: 'Keep as "draft" until content (e.g. refund policy) is finalized.',
    }),
  ],
  preview: {
    select: { title: 'question', subtitle: 'category' },
  },
});
