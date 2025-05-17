import { useState, useEffect } from 'react';
import { urlForImage } from "@/lib/image";
import { SanityImage, SanityImageWithCaption } from "../types";

interface ImageOrientations {
  [key: string]: 'portrait' | 'landscape' | 'unknown';
}

export function useImageOrientation(images: Array<SanityImage | SanityImageWithCaption>) {
  const [imageOrientations, setImageOrientations] = useState<ImageOrientations>({});

  useEffect(() => {
    if (!images.length) return;

    // Pre-load images to detect dimensions
    images.forEach((image, i) => {
      const imgKey = `img-${i}`;
      const img = new window.Image();
      const imageUrl = urlForImage(image).url();
      
      img.onload = () => {
        setImageOrientations(prev => ({
          ...prev,
          [imgKey]: img.height > img.width ? 'portrait' : 'landscape'
        }));
      };
      
      img.src = imageUrl;
    });
  }, [images]);

  // Helper function to get aspect ratio class and object fit based on orientation
  const getImageStyles = (imageKey: string) => {
    const orientation = imageOrientations[imageKey] || 'unknown';
    
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
  };

  return { imageOrientations, getImageStyles };
}