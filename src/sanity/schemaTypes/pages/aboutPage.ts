import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  // Prevent creating multiple instances
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'intro', title: 'Introduction' },
    { name: 'story', title: 'Our Story' },
    { name: 'team', title: 'Team Members' },
    { name: 'values', title: 'Values & Mission' },
    { name: 'seo', title: 'SEO & Metadata' },
  ],
  fields: [
    // Page title (mostly for internal reference)
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      initialValue: 'About Us',
      readOnly: true,
      group: 'intro',
    }),
    
    // Introduction Section
    defineField({
      name: 'introTitle',
      title: 'Introduction Title',
      type: 'string',
      group: 'intro',
    }),
    defineField({
      name: 'introText',
      title: 'Introduction Text',
      type: 'text',
      rows: 4,
      group: 'intro',
    }),
    defineField({
      name: 'introImage',
      title: 'Introduction Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'intro',
    }),
    
    // Our Story Section
    defineField({
      name: 'storyTitle',
      title: 'Our Story Title',
      type: 'string',
      group: 'story',
    }),
    defineField({
      name: 'storyContent',
      title: 'Our Story Content',
      type: 'array',
      of: [{ type: 'block' }], // Rich text editor
      group: 'story',
    }),
    defineField({
      name: 'storyImage',
      title: 'Story Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'story',
    }),
    
    // Team Members Section
    defineField({
      name: 'teamSectionTitle',
      title: 'Team Section Title',
      type: 'string',
      group: 'team',
    }),
    defineField({
      name: 'teamMembers',
      title: 'Team Members',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'name',
            title: 'Name',
            type: 'string',
          },
          {
            name: 'role',
            title: 'Role',
            type: 'string',
          },
          {
            name: 'bio',
            title: 'Bio',
            type: 'text',
          },
          {
            name: 'image',
            title: 'Photo',
            type: 'image',
            options: {
              hotspot: true,
            },
          },
        ],
        preview: {
          select: {
            title: 'name',
            subtitle: 'role',
            media: 'image'
          }
        }
      }],
      group: 'team',
    }),
    
    // Values & Mission
    defineField({
      name: 'valuesTitle',
      title: 'Values Title',
      type: 'string',
      group: 'values',
    }),
    defineField({
      name: 'values',
      title: 'Core Values',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'title',
            title: 'Value Title',
            type: 'string',
          },
          {
            name: 'description',
            title: 'Description',
            type: 'text',
          }
        ]
      }],
      group: 'values',
    }),
    defineField({
      name: 'missionStatement',
      title: 'Mission Statement',
      type: 'text',
      rows: 3,
      group: 'values',
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
      subtitle: 'introTitle',
      media: 'introImage',
    },
  },
})