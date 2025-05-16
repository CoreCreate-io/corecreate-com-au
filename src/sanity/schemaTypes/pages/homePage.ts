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

    // Single subtitle field with rich text
    defineField({
      name: 'subtitleText',
      title: 'Subtitle Text',
      description: 'Text shown below the video (use formatting to highlight important words)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' }, 
              { title: 'Emphasis', value: 'em' }
            ],
            annotations: [
              {
                name: 'highlight',
                type: 'object',
                title: 'Highlight', 
                fields: [
                  {
                    name: 'active',
                    type: 'boolean',
                    title: 'Highlight Text',
                    initialValue: true
                  }
                ]
              }
            ]
          }
        }
      ],
      group: 'hero',
    }),
    
    // Replace the old featureVideo field with these new fields
    defineField({
      name: 'featureVideoEnabled',
      title: 'Enable Featured Video',
      type: 'boolean',
      description: 'Toggle to show a featured video in the hero section',
      initialValue: false,
      group: 'hero',
    }),
    
    defineField({
      name: 'featureVideo',
      title: 'Feature Video',
      type: 'object',
      description: 'Upload a video to display in the hero section. Will autoplay.',
      group: 'hero',
      fields: [
        { 
          name: "title", 
          title: "Video Title", 
          type: "string" 
        },
        {
          name: "video",
          title: "Video file",
          type: "mux.video"
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