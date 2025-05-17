import React from 'react';
import Image from 'next/image';
import { urlForImage } from "@/lib/image";
import { SanityImage, SanityImageWithCaption } from "../../types";

interface StackedGalleryProps {
  images: Array<SanityImage | SanityImageWithCaption>;
  isMobile: boolean;
  getImageStyles: (key: string) => { aspect: string; objectFit: string };
  onImageClick: (index: number) => void;
}

export function StackedGallery({ 
  images, 
  isMobile, 
  getImageStyles,
  onImageClick
}: StackedGalleryProps) {
  return (
    <div className={`flex flex-col ${isMobile ? 'space-y-1' : 'space-y-4'}`}>
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
                width={1200}
                height={800}
                className={`w-full h-auto ${isMobile ? '' : 'rounded-md'}`}
                sizes="100vw"
                priority={index < 3}
                loading={index < 3 ? "eager" : "lazy"}
              />
            </div>
            
            {imageWithCaption.caption && (
              <p className={`text-sm text-muted-foreground mt-1 ${isMobile ? 'px-4 pb-1' : ''}`}>
                {imageWithCaption.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}