import { defineField, defineType } from 'sanity';

// Define the possible category types as a union type
type CategoryType = 'creativeField' | 'sector' | 'subCategory';

// Define an interface for the labels
interface CategoryTypeLabels {
  creativeField: string;
  sector: string;
  subCategory: string;
  [key: string]: string;
}

// Create a properly typed object for the labels
const categoryTypeLabels: CategoryTypeLabels = {
  creativeField: 'Creative Field',
  sector: 'Sector',
  subCategory: 'Sub-Category'
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
    {
      name: 'relationships',
      title: 'Relationships',
    }
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
    // Add the featured image field for category filter display
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      description: 'Image to display on category filter buttons',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'appearance',
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
          { title: 'Creative Field', value: 'creativeField' }, // Photography, Videography, etc.
          { title: 'Sector', value: 'sector' }, // Real Estate, Construction, etc.
          { title: 'Sub-Category', value: 'subCategory' }, // Wedding Photography, Brand Guidelines, etc.
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
      group: 'classification',
    }),
    // Add parent field relationship (for subcategories)
    defineField({
      name: 'parentField',
      title: 'Parent Creative Field',
      description: 'If this is a sub-category, select which Creative Field it belongs to',
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        filter: 'categoryType == "creativeField"' // Only allow linking to main fields
      },
      hidden: ({ document }) => document?.categoryType !== 'subCategory',
      group: 'relationships',
      validation: Rule => Rule.custom((field, context) => {
        // Only require parent field if this is a subcategory
        if (context.document?.categoryType === 'subCategory' && !field) {
          return 'Sub-categories must have a parent Creative Field';
        }
        return true;
      })
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
      parentTitle: 'parentField.title',
      media: 'featuredImage',
    },
    prepare({ title, categoryType, parentTitle, media }) {
      const type = categoryTypeLabels[categoryType as CategoryType] || '';
      const subtitle = categoryType === 'subCategory' && parentTitle ? 
        `${type} of ${parentTitle}` : type;
      
      return {
        title,
        subtitle,
        media,
      };
    },
  },
});