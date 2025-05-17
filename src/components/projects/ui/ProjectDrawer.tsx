import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { urlForImage } from "@/sanity/lib/image";
import { Project, SanityImage, SanityImageWithCaption } from "../types";
import { VideoPlayer } from "../components/DrawerVideoPlayer";
import { GalleryRenderer } from "../components/gallery/GalleryRenderer";
import { useImageOrientation } from "../hooks/useImageOrientation";

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
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { getImageStyles } = useImageOrientation(projectImages);
  
  // Get display mode from project
  const galleryDisplay = selectedProject?.gallery?.display || 'stacked';
  
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

  return (
    <Drawer open={selectedProject !== null && !isClosing} 
            onOpenChange={(open) => {
              // Only handle close events initiated by the drawer UI
              if (!open && selectedProject !== null && !isClosing) {
                setSelectedProject(null);
              }
            }}>
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
              videoLoaded ? (
                <VideoPlayer 
                  playbackId={selectedProject.featuredVideo.video.asset.playbackId}
                  title={selectedProject.title}
                />
              ) : (
                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                  <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
              )
            ) : projectImages.length > 0 && (
              <div className={`${isMobile ? 'mb-1' : 'mb-6'}`}>
                <div 
                  className="relative w-full cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(0);
                    setLightboxOpen(true);
                  }}
                >
                  {(() => {
                    const styles = getImageStyles('img-0');
                    return (
                      <div className={`relative ${styles.aspect}`}>
                        <Image
                          src={urlForImage(projectImages[0]).url()}
                          alt={selectedProject?.title || "Project featured image"}
                          width={1200}
                          height={800}
                          className={`w-full h-auto ${isMobile ? '' : 'rounded-md'}`}
                          sizes="100vw"
                          priority
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {/* Gallery - Skip first image if it's the same as featured image */}
            {projectImages.length > 1 && (
              <div className={`${isMobile ? 'mb-0' : 'mb-8'}`}>
                <GalleryRenderer
                  display={galleryDisplay}
                  images={projectImages.slice(1)}
                  isMobile={isMobile}
                  getImageStyles={getImageStyles}
                  onImageClick={(index) => {
                    setCurrentImageIndex(index + 1);
                    setLightboxOpen(true);
                  }}
                />
              </div>
            )}
            
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProjectDrawer;