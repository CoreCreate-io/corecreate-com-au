import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pages',
  title: 'Pages',
  type: 'document',
  // Use the documented way for restricting actions in newer Sanity versions
  documentActions: (prev, context) => prev.filter(action => 
    ['update', 'publish'].includes(action.name)
  ),
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Site Pages',
      readOnly: true,
    }),
    defineField({
      name: 'homePage',
      title: 'Home Page',
      type: 'homePage',
    }),
    // You'll add these later
    /* defineField({
      name: 'aboutPage',
      title: 'About Page',
      type: 'aboutPage',
    }),
    defineField({
      name: 'servicesPage',
      title: 'Services Page',
      type: 'servicesPage',
    }), */
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title,
      }
    },
  },
})