/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Path to pages directory
const pagesDir = path.join(__dirname, '../sanity/schemaTypes/pages');
// Output file
const indexFile = path.join(__dirname, '../sanity/schemaTypes/index.ts');

// Get all page files
const pageFiles = fs.readdirSync(pagesDir)
  .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
  .map(file => path.basename(file, path.extname(file)));

// Generate the index.ts content
const content = `// Auto-generated file - DO NOT MODIFY MANUALLY
import { type SchemaTypeDefinition } from 'sanity'
import project from './projects'
import category from './category'

// Automatically import all page schemas
${pageFiles.map(page => `import ${page} from './pages/${page}'`).join('\n')}

// For Sanity v3 schema configuration
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    project, 
    category,
    ${pageFiles.join(', ')}
  ],
}

// Alternative exports
export const schemaTypes = [
  project,
  category,
  ${pageFiles.join(', ')}
]
`;

// Write the file
fs.writeFileSync(indexFile, content);
console.log('Schema index updated with', pageFiles.length, 'page types');