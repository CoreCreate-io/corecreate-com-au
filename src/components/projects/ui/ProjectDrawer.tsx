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
import { MuxVideo } from "../components/MuxVideo";

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
              <div className="relative w-full aspect-video bg-black">
                {videoLoaded ? (
                  <MuxVideo
                    playbackId={selectedProject.featuredVideo.video.asset.playbackId}
                    className="w-full h-full"
                    controls={true}
                    autoplay={true}
                    loop={false}
                    muted={false}
                    controlsStyle="minimal"
                    view="drawer"
                    fitMode="contain"
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

export default ProjectDrawer;