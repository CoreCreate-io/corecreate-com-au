import { definePlugin } from 'sanity'

// This plugin ensures singleton documents exist
export const singletonPlugin = definePlugin({
  name: 'singleton-plugin',
  document: {
    // This hook runs when Sanity studio initializes
    unstable_beforeClient: async (client) => {
      try {
        // Dynamically get all schema types that end with "Page"
        const pageTypes = await client.fetch(
          `*[_type == "sanity.documentType" && name match "*Page"].name`
        ).catch(() => {
          // Fallback to hardcoded array if query fails
          return ['homePage', 'aboutPage', 'testPage'];
        });
        
        console.log('Detected page types:', pageTypes);
        
        // For each page type, check if it exists, create if needed
        const createIfNotExists = async (id) => {
          const doc = await client.fetch(`*[_id == $id][0]`, { id });
          if (!doc) {
            console.log(`Creating singleton document: ${id}`);
            await client.create({
              _id: id,
              _type: id
            });
          }
        };
        
        // Create any missing singletons
        for (const id of pageTypes) {
          await createIfNotExists(id);
        }
      } catch (error) {
        console.error('Error in singleton plugin:', error);
      }
    }
  }
})