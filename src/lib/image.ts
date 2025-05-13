import { client } from './sanity.client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Get a pre-configured url-builder from Sanity
const builder = imageUrlBuilder(client);

// Function to generate image URLs from Sanity image references
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}