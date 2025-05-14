import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'object',
  groups: [
    {
      name: 'hero',
      title: 'Hero Section',
    },
    {
      name: 'featured',
      title: 'Featured Content',
    },
    {
      name: 'services',
      title: 'Services Showcase',
    },
    {
      name: 'cta',
      title: 'Call to Action',
    },
    {
      name: 'seo',
      title: 'SEO & Metadata',
    },
  ],
  fields: [
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
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'hero',
    }),
    defineField({
      name: 'heroCTA',
      title: 'Hero Call to Action',
      type: 'object',
      group: 'hero',
      fields: [
        {
          name: 'text',
          title: 'Button Text',
          type: 'string',
        },
        {
          name: 'link',
          title: 'Button Link',
          type: 'string',
        },
      ],
    }),

    // Featured Projects Section
    defineField({
      name: 'featuredSectionTitle',
      title: 'Featured Section Title',
      type: 'string',
      group: 'featured',
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Featured Projects',
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

    // Services Showcase
    defineField({
      name: 'servicesTitle',
      title: 'Services Section Title',
      type: 'string',
      group: 'services',
    }),
    defineField({
      name: 'servicesIntro',
      title: 'Services Introduction',
      type: 'text',
      group: 'services',
    }),
    defineField({
      name: 'serviceItems',
      title: 'Service Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Service Title',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Service Description',
              type: 'text',
            },
            {
              name: 'icon',
              title: 'Service Icon',
              type: 'image',
            },
            {
              name: 'link',
              title: 'Service Detail Link',
              type: 'string',
            },
          ],
        },
      ],
      group: 'services',
    }),

    // Call to Action
    defineField({
      name: 'ctaTitle',
      title: 'CTA Title',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'text',
      group: 'cta',
    }),
    defineField({
      name: 'ctaButton',
      title: 'CTA Button',
      type: 'object',
      group: 'cta',
      fields: [
        {
          name: 'text',
          title: 'Button Text',
          type: 'string',
        },
        {
          name: 'link',
          title: 'Button Link',
          type: 'string',
        },
      ],
    }),

    // SEO
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
})