import React, { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { urlForImage } from "@/lib/image";
import { Project, SanityImageWithCaption } from "../types";

interface ProjectDrawerProps {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projectImages: any[];
  setCurrentImageIndex: (index: number) => void;
  setLightboxOpen: (open: boolean) => void;
}

export const ProjectDrawer = ({
  selectedProject,
  setSelectedProject,
  projectImages,
  setCurrentImageIndex,
  setLightboxOpen
}: ProjectDrawerProps) => {
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
    
    const isMobile = window.innerWidth < 768;
    
    // Function to update initial drawer height
    const updateInitialHeight = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      
      // Calculate initial height - 80% on mobile, 100% on desktop
      const initialHeight = isMobile ? Math.round(vh * 0.8) : vh;
      document.documentElement.style.setProperty('--drawer-initial-height', `${initialHeight}px`);
    };
    
    // Handle scroll to expand drawer when scrolling
    const handleScroll = () => {
      if (!isMobile) return;
      
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

  return (
    <Drawer 
      open={selectedProject !== null} 
      onOpenChange={(open) => {
        if (!open) setSelectedProject(null);
      }}
    >
      <DrawerContent className="drawer-override">
        <div className="mx-auto w-full max-w-[1440px] drawer-container-override">
          <div className="overflow-y-auto p-6 sm:p-10">
            {/* Close Button */}
            <DrawerClose className="drawer-close-fix">
              <Button variant="ghost" size="icon">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
            
            {/* Project Header */}
            <div className="mb-8">
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
            
            {/* Project Description */}
            {selectedProject?.description && (
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-3">About this project</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{selectedProject.description}</p>
              </div>
            )}
            
            {/* Featured Video or Image */}
            {selectedProject?.featuredVideoEnabled && selectedProject.featuredVideo?.asset?.url ? (
              <div className="mb-8">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
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
              <div className="mb-8">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={urlForImage(projectImages[0]).url()}
                    alt={selectedProject?.title || "Project featured image"}
                    fill
                    className="object-cover cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(0);
                      setLightboxOpen(true);
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Image Gallery - Skip first image if it's the same as featured image */}
            {projectImages.length > 1 && (
              <div className="mb-8">
                <div className="flex flex-col space-y-6">
                  {projectImages.slice(1).map((image, index) => {
                    // Use type assertion to tell TypeScript this might be a SanityImageWithCaption
                    const imageWithCaption = image as SanityImageWithCaption;
                    
                    return (
                      <div 
                        key={index}
                        className="relative cursor-pointer rounded-md overflow-hidden"
                        onClick={() => {
                          // Add 1 to index because we're skipping the first image
                          setCurrentImageIndex(index + 1);
                          setLightboxOpen(true);
                        }}
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={urlForImage(image).url()}
                            alt={imageWithCaption.caption || `${selectedProject?.title} image ${index + 2}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {imageWithCaption.caption && (
                          <p className="text-sm text-muted-foreground mt-1 px-2 pb-2">
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