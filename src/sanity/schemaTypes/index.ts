import { type SchemaTypeDefinition } from 'sanity'
import project from './projects'
import category from './category'

// Use Webpack's require.context to dynamically import all page schemas
// This creates a function that can import all matching modules from a directory
const pageSchemaContext = require.context('./pages/', false, /\.tsx?$/);

// Extract the page schemas from the context
const pageSchemas = pageSchemaContext.keys().map(key => {
  const schema = pageSchemaContext(key).default;
  return schema;
});

// For Sanity v3 schema configuration
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    project, 
    category,
    ...pageSchemas
  ],
}

// Alternative exports that might be needed in other parts of your code
export const schemaTypes = [
  project,
  category,
  ...pageSchemas
]

// Export the page schema types separately for PageManager.js to use
export const pageSchemaTypes = pageSchemas.map(schema => schema.name);