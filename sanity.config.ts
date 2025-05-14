'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import { pageManagerPlugin, structure } from './src/sanity/plugins/PageManager'
// Import the singleton plugin
import { singletonPlugin } from './src/sanity/plugins/singletonPlugin'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    // IMPORTANT: Pass the structure to structureTool
    structureTool({ structure }),
    
    // Add the pageManagerPlugin for document actions
    pageManagerPlugin(),
    
    // Add the singleton plugin here
    singletonPlugin(),
    
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
