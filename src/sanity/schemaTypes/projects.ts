import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
    },
    {
      name: 'media',
      title: 'Media',
    },
    {
      name: 'categories',
      title: 'Categories',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
    {
      name: 'metadata',
      title: 'Metadata',
    },
  ],
  fields: [
        // Add the featured field
        defineField({
  name: 'featuredVideoEnabled',
  title: 'Enable Featured Video',
  type: 'boolean',
  description: 'Toggle to show a featured video at the top of the project (replaces featured image as cover)',
  initialValue: false,
  group: 'media',
}),
defineField({
  name: 'featuredVideo',
  title: 'Featured Video',
  type: 'file',
  description: 'Upload a video to display as the featured cover. Will autoplay.',
  options: {
    accept: 'video/*',
  },
  group: 'media',
  hidden: ({ parent }) => !parent?.featuredVideoEnabled,
}),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Toggle to show this project in the Featured section',
      initialValue: false,
      group: 'categories',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'content',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'media',
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'object',
      group: 'media',
      fields: [
        {
          name: 'images',
          type: 'array',
          title: 'Images',
          of: [
            {
              name: 'image',
              type: 'image',
              title: 'Image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative text',
                },
                {
                  name: 'caption',
                  type: 'string',
                  title: 'Caption',
                },
              ],
            },
          ],
          options: {
            layout: 'grid',
          },
        },
        {
          name: 'display',
          type: 'string',
          title: 'Display as',
          description: 'How should we display these images?',
          options: {
            list: [
              { title: 'Stacked', value: 'stacked' },
              { title: 'Grid', value: 'grid' },
              { title: 'Carousel', value: 'carousel' },
              { title: 'Masonry', value: 'masonry' },
            ],
            layout: 'radio',
          },
          initialValue: 'grid',
        },
        {
          name: 'zoom',
          type: 'boolean',
          title: 'Zoom enabled',
          description: 'Should we enable zooming of images?',
          initialValue: true,
        },
      ],
    }),
    defineField({
      name: 'projectField',
      title: 'Project Field',
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        filter: 'categoryType == "field"',
      },
      validation: Rule => Rule.required(),
      group: 'categories',
    }),
    defineField({
      name: 'projectSector',
      title: 'Project Sector',
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        filter: 'categoryType == "sector"',
      },
      validation: Rule => Rule.required(),
      group: 'categories',
    }),
    defineField({
      name: 'customTags',
      title: 'Custom Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      group: 'categories',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'metadata',
    }),
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
          description: 'Image for social media sharing (Facebook, Twitter, etc.)',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags'
          }
        },
      ],
    }),
    defineField({
      name: 'clientInfo',
      title: 'Client Information',
      type: 'object',
      group: 'metadata',
      fields: [
        {
          name: 'clientName',
          title: 'Client Name',
          type: 'string',
        },
        {
          name: 'clientWebsite',
          title: 'Client Website',
          type: 'url',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      field: 'projectField.title',
      sector: 'projectSector.title',
      featured: 'featured',
    },
    prepare({ title, media, field, sector, featured }) {
      return {
        title: featured ? `★ ${title}` : title,
        subtitle: `${field || 'Uncategorized'} | ${sector || 'No sector'}`,
        media,
      };
    },
  },
});