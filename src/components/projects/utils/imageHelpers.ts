import { SanityImage } from "../types";
import { urlForImage } from "@/sanity/lib/image";

// Centralized image orientation detection
export function getImageOrientation(image: SanityImage): Promise<'portrait' | 'landscape' | 'square'> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      if (img.height > img.width) resolve('portrait');
      else if (img.width > img.height) resolve('landscape');
      else resolve('square');
    };
    img.src = urlForImage(image).url();
  });
}

// Get appropriate style classes based on orientation
export function getImageStylesByOrientation(orientation: 'portrait' | 'landscape' | 'square') {
  if (orientation === 'portrait') {
    return {
      aspect: 'aspect-[4/5]',
      objectFit: 'object-cover'
    };
  } else if (orientation === 'landscape') {
    return {
      aspect: 'aspect-auto',
      objectFit: 'object-contain'
    };
  }
  return {
    aspect: 'aspect-square',
    objectFit: 'object-cover'
  };
}

// Preload images efficiently
export function preloadImages(images: SanityImage[]) {
  return Promise.all(images.map(image => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = resolve;
      img.src = urlForImage(image).url();
    });
  }));
}