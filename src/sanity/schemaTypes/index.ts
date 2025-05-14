import { type SchemaTypeDefinition } from 'sanity'
import project from './projects'
import category from './category'
// Add these new imports
import pages from './documents/pages'
import homePage from './objects/homePage'

// For Sanity v3 schema configuration
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, category],
}

// Alternative exports that might be needed in other parts of your code
export const schemaTypes = [
  project,
  category,
  pages,
  homePage,
]
