import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { urlForImage } from "@/lib/image";
import { Project } from "../types";

export const ProjectThumbnailCarousel = ({ project }: { project: Project }) => {
  // This is fine as it's just a variable, not a hook
  const hasFeaturedVideo = project.featuredVideoEnabled === true && project.featuredVideo?.asset?.url;
  
  // ALWAYS declare ALL hooks at the top level, regardless of conditions
  
  // Image collection - must be at top level
  const projectImages = React.useMemo(() => {
    const images = [];
    if (project.featuredImage) {
      images.push(project.featuredImage);
    }
    if (project.gallery?.images && project.gallery.images.length > 0) {
      images.push(...project.gallery.images);
    }
    return images;
  }, [project]);

  // All state hooks at top level
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHorizontalSwiping, setIsHorizontalSwiping] = useState(false);
  const interval = 5000;
  
  // All ref hooks at top level
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const savedScrollPosition = useRef(0);
  const isMobile = useRef(false);
  const touchMoved = useRef(false);
  
  // All callback hooks at top level
  const clearTimers = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }
  }, []);
    
  // Start progress function - at top level, but can have early returns inside
  const startProgress = useCallback(() => {
    // It's fine to have early returns inside callback bodies
    if (hasFeaturedVideo || projectImages.length <= 1) return;
    
    clearTimers();
    const progressInterval = 50;
    const progressIncrement = (progressInterval / interval) * 100;
    
    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + progressIncrement;
        if (next >= 100) {
          if (!slideTimerRef.current) {
            const currentIdx = currentIndex;
            slideTimerRef.current = setTimeout(() => {
              const newIndex = (currentIdx + 1) % projectImages.length;
              setCurrentIndex(newIndex);
              setProgress(0);
              startProgress();
              slideTimerRef.current = null;
            }, 50);
          }
          return 100;
        }
        return next;
      });
    }, progressInterval);
  }, [clearTimers, interval, currentIndex, projectImages.length, hasFeaturedVideo]);
  
  // All other callbacks at top level
  const updateSlide = useCallback((newIndex: number) => {
    clearTimers();
    setCurrentIndex(newIndex);
    setProgress(0);
    startProgress();
  }, [clearTimers, startProgress]);
    
  const nextSlide = useCallback(() => {
    const newIndex = (currentIndex + 1) % projectImages.length;
    updateSlide(newIndex);
  }, [currentIndex, projectImages.length, updateSlide]);
    
  const prevSlide = useCallback(() => {
    const newIndex = (currentIndex - 1 + projectImages.length) % projectImages.length;
    updateSlide(newIndex);
  }, [currentIndex, projectImages.length, updateSlide]);

  // Handle touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    savedScrollPosition.current = window.scrollY;
    touchMoved.current = false;
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY) * 1.1) {
      e.preventDefault();
      touchMoved.current = true;
      
      if (!isHorizontalSwiping) {
        setIsHorizontalSwiping(true);
      }
      
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        touchStartX.current = null;
        touchStartY.current = null;
      }
    }
  }, [nextSlide, prevSlide, isHorizontalSwiping]);
  
  const handleTouchEnd = useCallback(() => {
    setIsHorizontalSwiping(false);
  }, []);

  // Effects always at top level too
  useEffect(() => {
    // It's fine to have early returns inside effect bodies
    if (hasFeaturedVideo || projectImages.length <= 1 || isPaused) return;
    
    clearTimers();
    
    const progressInterval = 50;
    const progressIncrement = (progressInterval / interval) * 100;
    
    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + progressIncrement;
        if (next >= 100) {
          if (!slideTimerRef.current) {
            slideTimerRef.current = setTimeout(() => {
              nextSlide();
              slideTimerRef.current = null;
            }, 50);
          }
          return 100;
        }
        return next;
      });
    }, progressInterval);
    
    return clearTimers;
  }, [clearTimers, isPaused, interval, nextSlide, projectImages.length, hasFeaturedVideo]);

  // Mobile detection effect - always at top level
  useEffect(() => {
    const checkMobile = () => {
      isMobile.current = window.innerWidth < 768;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Calculate adjacent indices for preloading
  const getAdjacentIndices = useCallback(() => {
    const prev = (currentIndex - 1 + projectImages.length) % projectImages.length;
    const next = (currentIndex + 1) % projectImages.length;
    return { prev, next };
  }, [currentIndex, projectImages.length]);

  // NOW we can conditionally render based on our variables
  if (hasFeaturedVideo) {
    return (
      <div className="w-full h-full relative rounded-lg overflow-hidden">
        <video
          src={project.featuredVideo?.asset?.url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          disablePictureInPicture
          controlsList="nodownload"
        />
      </div>
    );
  }
  
  // Return single image if only one exists
  if (projectImages.length <= 1) {
    const imageToShow = projectImages[0];
    
    if (!imageToShow) {
      return (
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No image</p>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full relative">
        <Image
          src={urlForImage(imageToShow).url()}
          alt={project.title || "Project image"}
          fill
          className="object-cover"
        />
      </div>
    );
  }
  
  // Full carousel for multiple images
  return (
    <div 
      className="w-full h-full relative select-none rounded-lg overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Arrow controls for desktop */}
      {showControls && !isMobile.current && projectImages.length > 1 && (
        <>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-opacity duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-opacity duration-200"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Progress bars */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex gap-1 p-2">
        {projectImages.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1 ${idx === currentIndex ? 'bg-black/40' : 'bg-black/20'} rounded-full flex-1 cursor-pointer overflow-hidden`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
              clearTimers();
              
              setProgress(1);
              
              setTimeout(() => {
                if (!isPaused) {
                  startProgress();
                }
              }, 50);
            }}
          >
            {idx === currentIndex && (
              <div 
                className="h-full bg-[#BAFF00] rounded-full transition-all duration-100" 
                style={{ width: `${progress === 0 ? 100 : progress}%` }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Preload adjacent images */}
      <div className="hidden">
        {projectImages.length > 1 && (
          <>
            <Image 
              src={urlForImage(projectImages[getAdjacentIndices().prev]).url()}
              alt="Preload previous"
              width={10}
              height={10}
              priority={true}
            />
            <Image 
              src={urlForImage(projectImages[getAdjacentIndices().next]).url()}
              alt="Preload next"
              width={10}
              height={10}
              priority={true}
            />
          </>
        )}
      </div>
      
      {/* Main image with transition */}
      <div className="w-full h-full relative">
        {projectImages.map((image, idx) => (
          <div
            key={idx}
            className="absolute inset-0"
            style={{
              opacity: idx === currentIndex ? 1 : 0,
              zIndex: idx === currentIndex ? 2 : 1,
              pointerEvents: idx === currentIndex ? 'auto' : 'none',
            }}
          >
            <Image
              src={urlForImage(image).url()}
              alt={project.title}
              fill
              priority={idx === currentIndex || 
                      idx === getAdjacentIndices().prev || 
                      idx === getAdjacentIndices().next}
              className="object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};