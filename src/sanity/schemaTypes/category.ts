import { defineField, defineType } from 'sanity';

// Define the possible category types as a union type
type CategoryType = 'field' | 'sector';

// Define an interface for the labels
interface CategoryTypeLabels {
  field: string;
  sector: string;
  [key: string]: string; // This allows any string key to be used
}

// Create a properly typed object for the labels
const categoryTypeLabels: CategoryTypeLabels = {
  field: 'Service Field',
  sector: 'Service Sector',
}

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  groups: [
    {
      name: 'basic',
      title: 'Basic Information',
    },
    {
      name: 'classification',
      title: 'Classification',
    },
    {
      name: 'appearance',
      title: 'Appearance',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
      group: 'basic',
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
      group: 'basic',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'basic',
    }),
    defineField({
      name: 'categoryType',
      title: 'Category Type',
      type: 'string',
      options: {
        list: [
          { title: 'Service Field', value: 'field' }, // Photography, Videography, etc.
          { title: 'Service Sector', value: 'sector' }, // Real Estate, Construction, etc.
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
      group: 'classification',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Use this to control the display order of categories',
      group: 'classification',
    }),
    defineField({
      name: 'icon',
      title: 'Category Icon',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'appearance',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      categoryType: 'categoryType',
      media: 'icon',
    },
    prepare({ title, categoryType, media }) {
      return {
        title,
        subtitle: categoryType ? categoryTypeLabels[categoryType as CategoryType] : '',
        media,
      };
    },
  },
});