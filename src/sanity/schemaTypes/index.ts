// Auto-generated file - DO NOT MODIFY MANUALLY
import { type SchemaTypeDefinition } from 'sanity'
import project from './projects'
import category from './category'

// Automatically import all page schemas
import aboutPage from './pages/aboutPage'
import homePage from './pages/homePage'

// For Sanity v3 schema configuration
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    project, 
    category,
    aboutPage, homePage
  ],
}

// Alternative exports
export const schemaTypes = [
  project,
  category,
  aboutPage, homePage
]
