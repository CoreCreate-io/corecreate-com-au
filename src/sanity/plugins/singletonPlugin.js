import { definePlugin } from 'sanity'

// This plugin ensures singleton documents exist
export const singletonPlugin = definePlugin({
  name: 'singleton-plugin',
  document: {
    // This hook runs when Sanity studio initializes
    unstable_beforeClient: async (client) => {
      // List of singleton document IDs
      const singletons = ['homePage', 'aboutPage'];
      
      // For each singleton, check if it exists, create if needed
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
      for (const id of singletons) {
        await createIfNotExists(id);
      }
    }
  }
})