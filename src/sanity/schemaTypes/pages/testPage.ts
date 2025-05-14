import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'testPage',
  title: 'Test Page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Basic title field
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
    }),
    
    // Simple content field
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    
    // Simple SEO field
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})