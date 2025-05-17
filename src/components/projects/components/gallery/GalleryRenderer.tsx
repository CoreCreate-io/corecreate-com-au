import React from 'react';
import { StackedGallery } from './StackedGallery';
import { GridGallery } from './GridGallery';
import { CarouselGallery } from './CarouselGallery';
import { MasonryGallery } from './MasonryGallery';
import { SanityImage, SanityImageWithCaption } from "../../types";

interface GalleryRendererProps {
  display: 'stacked' | 'grid' | 'carousel' | 'masonry';
  images: Array<SanityImage | SanityImageWithCaption>;
  isMobile: boolean;
  getImageStyles: (key: string) => { aspect: string; objectFit: string };
  onImageClick: (index: number) => void;
}

export function GalleryRenderer({ 
  display, 
  images, 
  isMobile, 
  getImageStyles,
  onImageClick
}: GalleryRendererProps) {
  switch(display) {
    case 'grid': 
      return <GridGallery images={images} isMobile={isMobile} getImageStyles={getImageStyles} onImageClick={onImageClick} />;
    case 'carousel': 
      return <CarouselGallery images={images} isMobile={isMobile} getImageStyles={getImageStyles} onImageClick={onImageClick} />;
    case 'masonry': 
      return <MasonryGallery images={images} isMobile={isMobile} getImageStyles={getImageStyles} onImageClick={onImageClick} />;
    case 'stacked':
    default:
      return <StackedGallery images={images} isMobile={isMobile} getImageStyles={getImageStyles} onImageClick={onImageClick} />;
  }
}