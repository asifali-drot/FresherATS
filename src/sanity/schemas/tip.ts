import { defineField, defineType } from 'sanity';

export const tip = defineType({
  name: 'tip',
  title: 'Career Tip',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Resume', value: 'resume' },
          { title: 'Interview', value: 'interview' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'General', value: 'general' },
        ],
      },
    }),
    defineField({
      name: 'details',
      title: 'Details/Checklist',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
    },
    prepare({ title, category }) {
      const categoryLabel: Record<string, string> = {
        resume: '📄 Resume',
        interview: '🎤 Interview',
        linkedin: '💼 LinkedIn',
        general: '💡 General',
      };
      return {
        title: title || 'Untitled Tip',
        subtitle: category ? categoryLabel[category] ?? category : 'No category',
      };
    },
  },
});
