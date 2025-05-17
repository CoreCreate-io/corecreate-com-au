import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlForImage } from "@/lib/image";
import { SanityImage, SanityImageWithCaption } from "../../types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

interface CarouselGalleryProps {
  images: Array<SanityImage | SanityImageWithCaption>;
  isMobile: boolean;
  getImageStyles: (key: string) => { aspect: string; objectFit: string };
  onImageClick: (index: number) => void;
}

export function CarouselGallery({
  images,
  isMobile,
  getImageStyles,
  onImageClick
}: CarouselGalleryProps) {
  // Use embla carousel hook directly
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
  });
  
  // Track the current slide
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update selected index when carousel changes
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);
  
  // Function to control carousel navigation
  const scrollTo = (index: number) => emblaApi?.scrollTo(index);
  
  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent ref={emblaRef}>
          {images.map((image, index) => {
            const imageWithCaption = image as SanityImageWithCaption;
            
            return (
              <CarouselItem key={index} className="relative cursor-pointer">
                <div 
                  className="relative aspect-square" // Changed from aspect-[16/9] to aspect-square
                  onClick={() => onImageClick(index + 1)}
                >
                  <Image
                    src={urlForImage(image).url()}
                    alt={imageWithCaption.caption || `Project image ${index + 2}`}
                    width={1200}
                    height={1200} // Changed to match square aspect ratio
                    className={`w-full h-full object-cover ${isMobile ? '' : 'rounded-md'}`} // Changed from object-contain to object-cover
                    sizes="100vw"
                    priority={index < 2}
                  />
                </div>
                
                {imageWithCaption.caption && (
                  <p className="text-sm text-center text-muted-foreground mt-2">
                    {imageWithCaption.caption}
                  </p>
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Carousel controls - only show if multiple images */}
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
    </div>
  );
}