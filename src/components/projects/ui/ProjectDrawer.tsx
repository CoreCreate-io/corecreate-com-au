import React, { useEffect, useState } from "react";
import Image from "next/image"; // This import is shadowing the global Image constructor
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { urlForImage } from "@/lib/image";
import { Project, SanityImage, SanityImageWithCaption } from "../types";

interface ProjectDrawerProps {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projectImages: Array<SanityImage | SanityImageWithCaption>;
  setCurrentImageIndex: (index: number) => void;
  setLightboxOpen: (open: boolean) => void;
  isClosing?: boolean; // Add this prop
}

// Track image orientations
interface ImageOrientations {
  [key: string]: 'portrait' | 'landscape' | 'unknown';
}

export const ProjectDrawer = ({
  selectedProject,
  setSelectedProject,
  projectImages,
  setCurrentImageIndex,
  setLightboxOpen,
  isClosing = false // Default to false
}: ProjectDrawerProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [imageOrientations, setImageOrientations] = useState<ImageOrientations>({});
  
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
  
  // Add this to preload project images when drawer opens
  useEffect(() => {
    if (selectedProject && projectImages.length > 0) {
      // Preload all images
      projectImages.forEach((image) => {
        const img = new window.Image();
        img.src = urlForImage(image).url();
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

  // Safari URL bar detection and handling
  useEffect(() => {
    if (!selectedProject) return;
  
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const drawerContent = document.querySelector('[data-vaul-drawer-content][data-vaul-drawer-direction="bottom"]');
    
    if (!drawerContent) return;
    
    // Function to update viewport height AND position based on visualViewport
    const setViewportHeight = () => {
      // Use visualViewport API for most accurate height/position on mobile
      const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const offsetTop = window.visualViewport ? window.visualViewport.offsetTop : 0;
      
      document.documentElement.style.setProperty('--drawer-viewport-height', `${height}px`);
      document.documentElement.style.setProperty('--drawer-offset-top', `${offsetTop}px`);
    };
  
    // Initial setting
    setViewportHeight();
  
    // Add all relevant event listeners
    const events = ['resize', 'orientationchange'];
    events.forEach(event => window.addEventListener(event, setViewportHeight));
    
    // Safari-specific handling using visualViewport
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setViewportHeight);
      window.visualViewport.addEventListener('scroll', setViewportHeight);
    }
  
    // Special handling for iOS scroll events
    if (isIOS) {
      window.addEventListener('scroll', setViewportHeight);
    }
  
    return () => {
      events.forEach(event => window.removeEventListener(event, setViewportHeight));
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setViewportHeight);
        window.visualViewport.removeEventListener('scroll', setViewportHeight);
      }
      if (isIOS) {
        window.removeEventListener('scroll', setViewportHeight);
      }
    };
  }, [selectedProject]);
  
  // Drawer expansion on scroll
  useEffect(() => {
    if (!selectedProject) return;
  
    const drawerContent = document.querySelector('[data-vaul-drawer-content][data-vaul-drawer-direction="bottom"]');
    const innerContent = document.querySelector('.drawer-container-override');
    
    if (!drawerContent || !innerContent) return;
    
    const isMobileSize = window.innerWidth < 768;
    
    // Function to update initial drawer height
    const updateInitialHeight = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      
      // Calculate initial height - 80% on mobile, 100% on desktop
      const initialHeight = isMobileSize ? Math.round(vh * 0.8) : vh;
      document.documentElement.style.setProperty('--drawer-initial-height', `${initialHeight}px`);
    };
    
    // Handle scroll to expand drawer when scrolling
    const handleScroll = () => {
      if (!isMobileSize) return;
      
      const scrollTop = (innerContent as HTMLElement).scrollTop;
      
      // Add/remove expanded class based on scroll position
      if (scrollTop > 30 && !drawerContent.classList.contains('fully-expanded')) {
        drawerContent.classList.add('fully-expanded');
      } else if (scrollTop < 10 && drawerContent.classList.contains('fully-expanded')) {
        drawerContent.classList.remove('fully-expanded');
      }
    };
    
    // Initial setup - make sure drawer starts at initial height
    updateInitialHeight();
    
    // Reset expanded state when drawer opens
    if (drawerContent.classList.contains('fully-expanded')) {
      drawerContent.classList.remove('fully-expanded');
    }
    
    // Window resize handler for updating initial height
    const handleResize = () => {
      updateInitialHeight();
    };
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    innerContent.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      innerContent.removeEventListener('scroll', handleScroll);
    };
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

  return (
<Drawer 
  open={selectedProject !== null} 
  onOpenChange={(open) => {
    // Only handle close events from UI interactions, and only if not already closing
    if (!open && selectedProject !== null && !isClosing) {
      setSelectedProject(null);
    }
    // Never handle open events - let the parent component control opening
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
              <h2 className="text-3xl font-heading font-semibold">{selectedProject?.title}</h2>
              {selectedProject?.clientInfo?.clientName && (
                <p className="text-xl text-muted-foreground mt-1">
                  {selectedProject.clientInfo.clientName}
                </p>
              )}
              
              {/* Project Categories */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedProject?.projectField && (
                  <Badge>{selectedProject.projectField.title}</Badge>
                )}
                {selectedProject?.projectSector && (
                  <Badge variant="secondary">{selectedProject.projectSector.title}</Badge>
                )}
              </div>
            </div>
            
            {/* Project Description - add padding only on mobile */}
            {selectedProject?.description && (
              <div className={`mb-4 ${isMobile ? 'px-4' : ''}`}>
                <h3 className="text-xl font-medium mb-3">About this project</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{selectedProject.description}</p>
              </div>
            )}
            
            {/* Featured Video or Image */}
            {selectedProject?.featuredVideoEnabled && selectedProject.featuredVideo?.asset?.url ? (
              <div className={`${isMobile ? 'mb-1' : 'mb-6'}`}>
                <div className="relative w-full bg-black">
                  {/* No border-radius applied for videos */}
                  <video
                    src={selectedProject.featuredVideo.asset.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-full"
                    style={{ display: 'block' }}
                  />
                </div>
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
                          className="w-full h-auto"
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
                <div className={`flex flex-col ${isMobile ? 'space-y-0' : 'space-y-6'}`}>
                  {projectImages.slice(1).map((image, index, array) => {
                    // Use type assertion to tell TypeScript this might be a SanityImageWithCaption
                    const imageWithCaption = image as SanityImageWithCaption;
                    const imageKey = `img-${index + 1}`; // +1 because we've sliced off the first image
                    const styles = getImageStyles(imageKey);
                    const isLastImage = index === array.length - 1; // Check if this is the last image
                    
                    return (
                      <div 
                        key={index}
                        className="relative cursor-pointer"
                        onClick={() => {
                          // Add 1 to index because we're skipping the first image
                          setCurrentImageIndex(index + 1);
                          setLightboxOpen(true);
                        }}
                      >
                        {/* Dynamic aspect ratio based on image orientation - no mb-1 if it's the last image */}
                        <div className={`relative ${styles.aspect} ${!isLastImage ? 'mb-1' : ''}`}>
                          <Image
                            src={urlForImage(image).url()}
                            alt={imageWithCaption.caption || `${selectedProject?.title} image ${index + 2}`}
                            width={1200}
                            height={800}
                            className="w-full h-auto"
                            sizes="100vw"
                            priority={index < 3} // Prioritize first few images
                            loading={index < 3 ? "eager" : "lazy"}
                          />
                        </div>
                        
                        {/* Caption with padding only on desktop or if mobile */}
                        {imageWithCaption.caption && (
                          <p className={`text-sm text-muted-foreground mt-1 ${isMobile ? 'px-4 pb-2' : 'px-0 pb-0'}`}>
                            {imageWithCaption.caption}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};