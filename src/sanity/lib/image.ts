import createImageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from '../env';
import { client } from './sanity.client';

// Two approaches for image URL building:
// 1. Direct configuration with projectId/dataset
const configBuilder = createImageUrlBuilder({ projectId, dataset });

// 2. Using the pre-configured Sanity client (preferred)
const clientBuilder = createImageUrlBuilder(client);

/**
 * Generate image URLs from Sanity image references
 * @deprecated Use urlForImage() instead for consistency with client configuration
 */
export const urlFor = (source: SanityImageSource) => {
  return configBuilder.image(source);
};

/**
 * Generate image URLs from Sanity image references using the configured client
 * This is the preferred method as it ensures consistent configuration
 */
export function urlForImage(source: SanityImageSource) {
  return clientBuilder.image(source);
}

// Default export for easier imports
export default urlForImage;
