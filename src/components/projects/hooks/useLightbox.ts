import { useState, useRef, useCallback } from "react";

export const useLightbox = (totalImages: number) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Lightbox navigation handlers
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === totalImages - 1 ? 0 : prev + 1
    );
  }, [totalImages]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? totalImages - 1 : prev - 1
    );
  }, [totalImages]);

  // Handle key presses for lightbox navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setLightboxOpen(false);
  }, [nextImage, prevImage]);

  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleLightboxTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    
    const touchEndX = e.touches[0].clientX;
    const diffX = touchStartX.current - touchEndX;
    
    // Determine direction based on touch difference (with threshold)
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swiped left, go to next image
        nextImage();
      } else {
        // Swiped right, go to previous image
        prevImage();
      }
      // Reset touch start to prevent multiple triggers in one gesture
      touchStartX.current = null;
    }
  }, [nextImage, prevImage]);

  return {
    lightboxOpen,
    setLightboxOpen,
    currentImageIndex,
    setCurrentImageIndex,
    nextImage,
    prevImage,
    handleKeyDown,
    handleLightboxTouchStart,
    handleLightboxTouchMove,
    touchStartX
  };
};