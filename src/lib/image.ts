import imageUrlBuilder from '@sanity/image-url';
import { client } from './sanity.client';

// Define a type for Sanity image references
interface SanityImageSource {
  asset: {
    _ref: string;
    _type: string;
  };
  _type: string;
  [key: string]: any; // For any additional properties
}

const builder = imageUrlBuilder(client);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}