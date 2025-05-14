import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  groups: [
    { name: 'info', title: 'Contact Information' },
    { name: 'form', title: 'Contact Form' },
    { name: 'map', title: 'Map Location' },
  ],
  fields: [
    // Basic title field
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Contact Us',
      group: 'info',
    }),
    
    // Contact information
    defineField({
      name: 'emailAddress',
      title: 'Email Address',
      type: 'string',
      group: 'info',
    }),
    
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
      group: 'info',
    }),
    
    // Form settings
    defineField({
      name: 'formTitle',
      title: 'Form Title',
      type: 'string',
      group: 'form',
    }),
    
    // Map location
    defineField({
      name: 'locationAddress',
      title: 'Office Address',
      type: 'string',
      group: 'map',
    }),
  ],
  preview: {
    select: {
      title: 'pageTitle',
      subtitle: 'emailAddress',
    },
  },
})