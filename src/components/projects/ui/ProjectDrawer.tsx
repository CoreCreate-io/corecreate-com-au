import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image"; // This import is shadowing the global Image constructor
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { urlForImage } from "@/lib/image";
import { Project, SanityImage, SanityImageWithCaption } from "../types";
import MuxPlayer from '@mux/mux-player-react';
import { useSwipeable } from 'react-swipeable'; // You might need to install this: npm install react-swipeable

// Track image orientations
interface ImageOrientations {
  [key: string]: 'portrait' | 'landscape' | 'unknown';
}

// Add this interface to support the display mode
interface GalleryOptions {
  display: 'stacked' | 'grid' | 'carousel' | 'masonry';
  zoom?: boolean;
}

interface ProjectDrawerProps {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projectImages: Array<SanityImage | SanityImageWithCaption>;
  setCurrentImageIndex: (index: number) => void;
  setLightboxOpen: (open: boolean) => void;
  isClosing?: boolean; // Add this prop
}

const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
  selectedProject,
  setSelectedProject,
  projectImages,
  setCurrentImageIndex,
  setLightboxOpen,
  isClosing = false // Default to false
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [imageOrientations, setImageOrientations] = useState<ImageOrientations>({});
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Get display mode from project
  const galleryDisplay = selectedProject?.gallery?.display || 'stacked';
  const enableZoom = selectedProject?.gallery?.zoom !== false;
  
  // Detect image orientations for all project images
  useEffect(() => {
    if (!selectedProject || projectImages.length === 0) return;

    // Pre-load images to detect dimensions
    projectImages.forEach((image, i) => {
      const imgKey = `img-${i}`;
      // Use window.Image explicitly to avoid conflict with Next.js Image component
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
  }, [projectImages, selectedProject]);
  
  // Replace your current image preloading with this more efficient approach
  useEffect(() => {
    if (selectedProject && projectImages.length > 0) {
      // Only preload the first few images
      const imagesToPreload = projectImages.slice(0, Math.min(2, projectImages.length));
      
      // Use Promise.all to preload in parallel with a limit
      const preloadPromises = imagesToPreload.map((image) => {
        return new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Still resolve on error
          img.src = urlForImage(image).url();
        });
      });

      // After first few images load, then load the rest gradually
      Promise.all(preloadPromises).then(() => {
        // Progressively load remaining images
        projectImages.slice(2).forEach((image, i) => {
          setTimeout(() => {
            const img = new window.Image();
            img.src = urlForImage(image).url();
          }, i * 300); // Stagger loading
        });
      });
    }
  }, [selectedProject, projectImages]);
  
  // Check if we're on mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Delay video loading
  useEffect(() => {
    if (selectedProject?.featuredVideoEnabled) {
      // Delay video loading until after drawer animation
      const timer = setTimeout(() => {
        setVideoLoaded(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedProject]);

  // Helper function to get aspect ratio class and object fit based on orientation
  const getImageStyles = (imageKey: string) => {
    const orientation = imageOrientations[imageKey] || 'unknown';
    
    if (orientation === 'portrait') {
      return {
        aspect: 'aspect-[4/5]', // 4:5 for portrait
        objectFit: 'object-cover' // Cover is fine for portrait
      };
    } else if (orientation === 'landscape') {
      return {
        aspect: 'aspect-auto', // Let the image determine its own height
        objectFit: 'object-contain' // Contain ensures full image is visible
      };
    }
    
    // Default while detecting or if unknown
    return {
      aspect: 'aspect-square',
      objectFit: 'object-cover'
    };
  };

  // For carousel navigation
  const handlePrevious = useCallback(() => {
    if (currentCarouselIndex > 0) {
      setCurrentCarouselIndex(prev => prev - 1);
    }
  }, [currentCarouselIndex]);

  const handleNext = useCallback(() => {
    if (currentCarouselIndex < projectImages.length - 2) { // -2 because we slice(1)
      setCurrentCarouselIndex(prev => prev + 1);
    }
  }, [currentCarouselIndex, projectImages.length]);

  // Swipe handlers for carousel
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrevious(),
    trackMouse: true
  });

  // Update carousel position when index changes
  useEffect(() => {
    if (galleryDisplay === 'carousel' && carouselRef.current) {
      carouselRef.current.scrollTo({
        left: currentCarouselIndex * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, [currentCarouselIndex, galleryDisplay]);
  
  // Add these render functions before the return statement
  const renderStacked = () => (
    <div className={`flex flex-col ${isMobile ? 'space-y-1' : 'space-y-4'}`}>
      {projectImages.slice(1).map((image, index) => {
        const imageWithCaption = image as SanityImageWithCaption;
        const imageKey = `img-${index + 1}`;
        const styles = getImageStyles(imageKey);
        
        return (
          <div 
            key={index}
            className="relative cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(index + 1);
              setLightboxOpen(true);
            }}
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

  const renderGrid = () => (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${isMobile ? 'gap-1' : 'gap-4'}`}>
      {projectImages.slice(1).map((image, index) => {
        const imageWithCaption = image as SanityImageWithCaption;
        const imageKey = `img-${index + 1}`;
        const styles = getImageStyles(imageKey);
        
        return (
          <div 
            key={index}
            className="relative cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(index + 1);
              setLightboxOpen(true);
            }}
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

  const renderCarousel = () => (
    <div className="relative">
      <div 
        ref={carouselRef}
        className={`flex overflow-x-hidden snap-x snap-mandatory ${isMobile ? 'gap-1' : 'gap-4'}`}
        {...swipeHandlers}
      >
        {projectImages.slice(1).map((image, index) => {
          const imageWithCaption = image as SanityImageWithCaption;
          
          return (
            <div 
              key={index}
              className="relative min-w-full flex-shrink-0 snap-center cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(index + 1);
                setLightboxOpen(true);
              }}
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={urlForImage(image).url()}
                  alt={imageWithCaption.caption || `Project image ${index + 2}`}
                  width={1200}
                  height={800}
                  className={`w-full h-auto object-contain ${isMobile ? '' : 'rounded-md'}`}
                  sizes="100vw"
                  priority={index === currentCarouselIndex}
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
      {projectImages.length > 2 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 
            ${currentCarouselIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            disabled={currentCarouselIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 
            ${currentCarouselIndex >= projectImages.length - 2 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            disabled={currentCarouselIndex >= projectImages.length - 2}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      {/* Pagination dots */}
      {projectImages.length > 2 && (
        <div className="flex justify-center mt-4 gap-1.5">
          {projectImages.slice(1).map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                currentCarouselIndex === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
              onClick={(e) => { e.stopPropagation(); setCurrentCarouselIndex(index); }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderMasonry = () => (
    <div className={`columns-1 md:columns-2 lg:columns-3 ${isMobile ? 'gap-1' : 'gap-4'}`}>
      {projectImages.slice(1).map((image, index) => {
        const imageWithCaption = image as SanityImageWithCaption;
        
        return (
          <div 
            key={index}
            className={`relative ${isMobile ? 'mb-1' : 'mb-4'} break-inside-avoid cursor-pointer`}
            onClick={() => {
              setCurrentImageIndex(index + 1);
              setLightboxOpen(true);
            }}
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
  
  return (
<Drawer 
  open={selectedProject !== null && !isClosing} 
  onOpenChange={(open) => {
    // Only handle close events initiated by the drawer UI
    if (!open && selectedProject !== null && !isClosing) {
      setSelectedProject(null);
    }
    // Never handle drawer-initiated open events
  }}
>
      <DrawerContent className="drawer-override">
        <div className="mx-auto w-full max-w-[1440px] drawer-container-override">
          {/* Content area with adjusted padding based on screen size */}
          <div className={`overflow-y-auto ${isMobile ? 'p-0' : 'p-6 sm:p-10'}`}>
            {/* Close Button - moved inside to ensure visibility on mobile */}
            <div className={`${isMobile ? 'absolute right-2 top-2 z-10' : ''}`}>
              <DrawerClose className="drawer-close-fix">
                <Button variant={isMobile ? "secondary" : "ghost"} size="icon">
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </div>
            
            {/* Project Header - add padding only on mobile */}
            <div className={`mb-4 ${isMobile ? 'p-4' : ''}`}>
                            {selectedProject?.clientInfo?.clientName && (
                <p className="text-xl text-muted-foreground mt-1">
                  {selectedProject.clientInfo.clientName}
                </p>
              )}
              <h2 className="text-3xl font-heading font-semibold">{selectedProject?.title}</h2>
              
              {/* Project Categories */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedProject?.projectField && (
                  <Badge variant="default">{selectedProject.projectField.title}</Badge>
                )}
                
                {selectedProject?.projectSector && (
                  <Badge variant="secondary">{selectedProject.projectSector.title}</Badge>
                )}
                
                {/* Add subcategories display */}
                {selectedProject?.subCategories?.map(subCat => (
                  <Badge key={subCat._ref} variant="outline">
                    {subCat.title}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Project Description - add padding only on mobile */}
            {selectedProject?.description && (
              <div className={`mb-4 ${isMobile ? 'px-4' : ''}`}>
                <p className="text-muted-foreground text-lg leading-relaxed">{selectedProject.description}</p>
              </div>
            )}
            
            {/* Featured Video or Image */}
            {selectedProject?.featuredVideoEnabled && selectedProject.featuredVideo?.video?.asset?.playbackId ? (
              <div className="relative w-full aspect-video bg-black"
                   onClick={(e) => e.stopPropagation()}
                   onMouseDown={(e) => e.stopPropagation()}
                   onMouseUp={(e) => e.stopPropagation()}
                   onPointerDown={(e) => e.stopPropagation()}
                   style={{ isolation: 'isolate', position: 'relative', zIndex: 20 }} // Add these
              >
                {videoLoaded ? (
                  <MuxPlayer
                    playbackId={selectedProject.featuredVideo.video.asset.playbackId}
                    metadata={{ video_title: selectedProject.title }}
                    className="w-full h-full mux-player-override" // Add class for targeting in CSS
                    autoPlay={true}
                    loop={false}
                    muted={false}
                    defaultShowControls={true}
                    defaultHiddenCaptions={true}
                    thumbnailTime={0}
                    preload="auto"
                    accentColor="#BAFF00"  // Add this line
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'auto !important', // Add !important
                      touchAction: 'auto', // Improve touch handling
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
                ) : projectImages.length > 0 && (
                  <div className={`${isMobile ? 'mb-1' : 'mb-6'}`}>
                    <div 
                      className="relative w-full cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(0);
                        setLightboxOpen(true);
                      }}
                    >
                      {/* Dynamic styling based on image orientation */}
                      {(() => {
                        const styles = getImageStyles('img-0');
                        return (
                          <div className={`relative ${styles.aspect}`}>
                            <Image
                              src={urlForImage(projectImages[0]).url()}
                              alt={selectedProject?.title || "Project featured image"}
                              width={1200}
                              height={800}
                              className={`w-full h-auto ${isMobile ? '' : 'rounded-md'}`} // Added conditional rounded corners
                              sizes="100vw"
                              priority
                            />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
            )}
            
            {/* Image Gallery - Skip first image if it's the same as featured image */}
            {projectImages.length > 1 && (
              <div className={`${isMobile ? 'mb-0' : 'mb-8'}`}>
                {(() => {
                  switch(galleryDisplay) {
                    case 'grid': 
                      return renderGrid();
                    case 'carousel': 
                      return renderCarousel();
                    case 'masonry': 
                      return renderMasonry();
                    case 'stacked':
                    default:
                      return renderStacked();
                  }
                })()}
              </div>
            )}
            
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProjectDrawer;