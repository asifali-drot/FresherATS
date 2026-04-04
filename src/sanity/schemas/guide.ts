import { defineField, defineType } from 'sanity';

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Resume Mastery', value: 'resume-mastery' },
          { title: 'LinkedIn & Networking', value: 'linkedin-networking' },
          { title: 'Interview Success', value: 'interview-success' },
        ],
      },
    }),
    defineField({
      name: 'duration',
      title: 'Read Duration',
      type: 'string',
      description: 'e.g. 8 min read',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
  ],
});
