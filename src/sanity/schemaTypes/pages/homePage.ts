import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // This prevents creating multiple instances of the same page
  __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
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
    
    // Hero Section
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'hero',
    }),
    
    // Featured Projects Section
    defineField({
      name: 'featuredSectionTitle',
      title: 'Featured Section Title',
      type: 'string',
      group: 'featured',
    }),
    defineField({
      name: 'featuredSectionDescription',
      title: 'Featured Section Description',
      type: 'text',
      rows: 2,
      group: 'featured',
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Featured Projects',
      description: 'Select projects to feature on the homepage',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
          options: {
            filter: 'featured == true',
          },
        },
      ],
      group: 'featured',
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