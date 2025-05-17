import React from 'react';
import Image from 'next/image';
import { urlForImage } from "@/lib/image";
import { SanityImage, SanityImageWithCaption } from "../../types";

interface GridGalleryProps {
  images: Array<SanityImage | SanityImageWithCaption>;
  isMobile: boolean;
  getImageStyles: (key: string) => { aspect: string; objectFit: string };
  onImageClick: (index: number) => void;
}

export function GridGallery({
  images,
  isMobile,
  getImageStyles,
  onImageClick
}: GridGalleryProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${isMobile ? 'gap-1' : 'gap-4'}`}>
      {images.map((image, index) => {
        const imageWithCaption = image as SanityImageWithCaption;
        const imageKey = `img-${index + 1}`;
        const styles = getImageStyles(imageKey);
        
        return (
          <div 
            key={index}
            className="relative cursor-pointer"
            onClick={() => onImageClick(index + 1)}
          >
            <div className={`relative ${styles.aspect}`}>
              <Image
                src={urlForImage(image).url()}
                alt={imageWithCaption.caption || `Project image ${index + 2}`}
                width={800}
                height={600}
                className={`w-full h-auto ${isMobile ? '' : 'rounded-md'}`}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index < 2}
                loading={index < 2 ? "eager" : "lazy"}
              />
            </div>
            
            {imageWithCaption.caption && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {imageWithCaption.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}