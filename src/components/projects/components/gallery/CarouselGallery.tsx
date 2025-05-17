import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { urlForImage } from "@/lib/image";
import { SanityImage, SanityImageWithCaption } from "../../types";
import { useSwipeable } from 'react-swipeable';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Swipe handlers without ref
  const { ref: swipeRef, ...swipeHandlers } = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrevious(),
    trackMouse: true
  });

  // Update carousel position when index changes
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: currentIndex * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  return (
    <div className="relative">
      <div
        ref={(el) => {
          carouselRef.current = el;
          swipeRef(el);
        }}
        className={`flex overflow-x-hidden snap-x snap-mandatory ${isMobile ? 'gap-1' : 'gap-4'}`}
        {...swipeHandlers}
      >
        {images.map((image, index) => {
          const imageWithCaption = image as SanityImageWithCaption;
          
          return (
            <div 
              key={index}
              className="relative min-w-full flex-shrink-0 snap-center cursor-pointer"
              onClick={() => onImageClick(index + 1)}
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={urlForImage(image).url()}
                  alt={imageWithCaption.caption || `Project image ${index + 2}`}
                  width={1200}
                  height={800}
                  className={`w-full h-auto object-contain ${isMobile ? '' : 'rounded-md'}`}
                  sizes="100vw"
                  priority={index === currentIndex}
                />
              </div>
              
              {imageWithCaption.caption && (
                <p className="text-sm text-center text-muted-foreground mt-2">
                  {imageWithCaption.caption}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Carousel controls */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 
            ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 
            ${currentIndex >= images.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            disabled={currentIndex >= images.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      {/* Pagination dots */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}