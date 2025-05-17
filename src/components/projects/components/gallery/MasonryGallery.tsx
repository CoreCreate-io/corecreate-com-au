import React from 'react';
import Image from 'next/image';
import { urlForImage } from "@/lib/image";
import { SanityImage, SanityImageWithCaption } from "../../types";

interface MasonryGalleryProps {
  images: Array<SanityImage | SanityImageWithCaption>;
  isMobile: boolean;
  getImageStyles: (key: string) => { aspect: string; objectFit: string };
  onImageClick: (index: number) => void;
}

export function MasonryGallery({
  images,
  isMobile,
  getImageStyles,
  onImageClick
}: MasonryGalleryProps) {
  return (
    <div className={`columns-1 md:columns-2 lg:columns-3 ${isMobile ? 'gap-1' : 'gap-4'}`}>
      {images.map((image, index) => {
        const imageWithCaption = image as SanityImageWithCaption;
        
        return (
          <div 
            key={index}
            className={`relative ${isMobile ? 'mb-1' : 'mb-4'} break-inside-avoid cursor-pointer`}
            onClick={() => onImageClick(index + 1)}
          >
            <Image
              src={urlForImage(image).url()}
              alt={imageWithCaption.caption || `Project image ${index + 2}`}
              width={800}
              height={600}
              className={`w-full h-auto ${isMobile ? '' : 'rounded-md'}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 3}
            />
            
            {imageWithCaption.caption && (
              <p className="text-sm text-muted-foreground mt-1">
                {imageWithCaption.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}