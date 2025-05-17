import { useState, useRef, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';

export function useCarousel(itemCount: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < itemCount - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, itemCount]);

  // Swipe handlers for carousel
  const swipeHandlers = useSwipeable({
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
  
  return {
    currentIndex,
    setCurrentIndex,
    handlePrevious,
    handleNext,
    swipeHandlers,
    carouselRef
  };
}