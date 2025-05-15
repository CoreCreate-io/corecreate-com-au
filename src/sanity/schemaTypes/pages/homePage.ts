import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // Better type assertion
  groups: [
    { name: 'hero', title: 'Hero Section' },
    { name: 'featured', title: 'Featured Projects' },
    { name: 'services', title: 'Services Section' },
    { name: 'seo', title: 'SEO & Metadata' },
  ],
  fields: [
    // Page title (mostly for internal reference)
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Home Page',
      readOnly: true,
      group: 'hero',
    }),
    
    // Example field definition to add to your page schemas
    defineField({
      name: 'featureVideo',
      title: 'Feature Video',
      type: 'file',
      options: {
        accept: 'video/*'
      },
      fields: [
        {
          name: 'title',
          title: 'Video Title',
          type: 'string'
        },
        {
          name: 'caption',
          title: 'Caption',
          type: 'string'
        }
      ]
    }),

    // SEO Section
    defineField({
      name: 'seo',
      title: 'SEO & Social Sharing',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
        },
        {
          name: 'ogImage',
          title: 'Social Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'pageTitle',
      subtitle: 'heroTitle',
      media: 'heroImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Home Page',
        subtitle: subtitle,
        media,
      }
    },
  },
})