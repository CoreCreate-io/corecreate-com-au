"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { urlForImage } from "@/lib/image";
import { Container } from "@/components/layout/container";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";



// Add these interface definitions
interface SanityImage {
  _type: string;
  asset: {
    _ref: string;
    _type: string;
  };
  alt?: string;
}

interface SanityImageWithCaption extends SanityImage {
  _key: string;
  caption?: string;
}

// First, update your interface to include a more specific type for gallery images
export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  featuredImage: SanityImage;
  // Match your actual schema structure
  gallery?: {
    images?: Array<SanityImageWithCaption>;
    display?: 'stacked' | 'grid' | 'carousel' | 'masonry';
    zoom?: boolean;
  };
  projectField: { title: string };
  projectSector: { title: string };
  clientInfo?: { 
    clientName?: string;
    clientWebsite?: string;
  };
  featured?: boolean;
}

interface ProjectsGridProps {
  projects: Project[];
  categories: string[];
  loading: boolean;
}

// Component for project skeleton during loading
const ProjectSkeleton = () => (
  <div className="group relative overflow-hidden rounded-lg">
    <Skeleton className="h-80 w-full" />
    <div className="mt-3">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-6 w-full max-w-[250px]" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

export function ProjectsGrid({ projects, categories, loading }: ProjectsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Add touch swipe detection for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
  };

  const touchStartX = useRef<number | null>(null);

  // Filter projects based on search query and active category
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.clientInfo?.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Update to use featured field for the Featured category
    const matchesCategory = 
      activeCategory === "Featured" 
        ? project.featured === true
        : project.projectField?.title === activeCategory || 
          project.projectSector?.title === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Create an array of skeleton placeholders for loading state
  const skeletons = Array.from({ length: 4 }).map((_, i) => <ProjectSkeleton key={`skeleton-${i}`} />);

  // Get all images for the selected project (including featured image)
  const getAllProjectImages = (project: Project | null) => {
    if (!project) return [];
    
    const images = [];
    
    // Add featured image if it exists
    if (project.featuredImage) {
      images.push(project.featuredImage);
    }
    
    // Add gallery images if they exist
    if (project.gallery?.images && project.gallery.images.length > 0) {
      images.push(...project.gallery.images);
    }
    
    return images;
  };

  const projectImages = getAllProjectImages(selectedProject);
  
  // Lightbox navigation handlers
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === projectImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? projectImages.length - 1 : prev - 1
    );
  };

  // Handle key presses for lightbox navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  // Update the drawer scroll behavior useEffect
  useEffect(() => {
    // Get references to DOM elements
    const drawerContent = document.querySelector('[data-vaul-drawer-content][data-vaul-drawer-direction="bottom"]');
    const innerContent = document.querySelector('.drawer-container-override');
    
    if (!drawerContent || !selectedProject) return;
    
    // iOS Safari detection
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    // Set CSS variable for dynamic viewport height
    const updateWindowHeight = () => {
      const windowHeight = window.innerHeight;
      document.documentElement.style.setProperty('--window-height', `${windowHeight}px`);
      // Also set the vh unit for browsers that don't support var()
      document.documentElement.style.setProperty('--vh', `${windowHeight * 0.01}px`);
      
      return windowHeight;
    };
    
    // Initial height setup
    let windowHeight = updateWindowHeight();
    
    // Function to measure and apply the correct height
    const updateHeight = (expand = false) => {
      // Get fresh viewport height
      windowHeight = updateWindowHeight();
      
      // Different heights for mobile vs desktop
      if (window.innerWidth < 768) {
        // For mobile: start at 85% height, full height when expanded
        const height = expand ? windowHeight : Math.floor(windowHeight * 0.85);
        
        // Force height directly on the element
        (drawerContent as HTMLElement).style.height = `${height}px`;
        (drawerContent as HTMLElement).style.maxHeight = `${height}px`;
        
        // Update class for CSS transitions
        if (expand) {
          drawerContent.classList.add('fully-expanded');
        } else {
          drawerContent.classList.remove('fully-expanded');
        }
      } else {
        // For desktop: always full height
        (drawerContent as HTMLElement).style.height = `${windowHeight}px`;
        (drawerContent as HTMLElement).style.maxHeight = `${windowHeight}px`;
      }
    };
    
    // Set the initial height when the drawer opens
    updateHeight(false);
    
    // Handle scroll events for expanding/contracting
    const handleScroll = () => {
      if (window.innerWidth >= 768 || !innerContent) return;
      
      const scrollTop = (innerContent as HTMLElement).scrollTop;
      
      // Expand when scrolled down, contract when scrolled back to top
      if (scrollTop > 50 && !drawerContent.classList.contains('fully-expanded')) {
        updateHeight(true);
      } else if (scrollTop < 20 && drawerContent.classList.contains('fully-expanded')) {
        updateHeight(false);
      }
    };
    
    // Create a highly responsive event system for Safari
    let lastHeight = windowHeight;
    let resizeTimeout: NodeJS.Timeout;
    
    // For iOS Safari, adapt to URL bar changes
    const handleVisualViewportResize = () => {
      if (isIOS) {
        updateWindowHeight();
        
        // Use requestAnimationFrame for smoother updates
        window.requestAnimationFrame(() => {
          updateHeight(drawerContent.classList.contains('fully-expanded'));
        });
      }
    };
    
    // Handle general viewport changes (orientation, etc.)
    const handleResize = () => {
      // Clear previous timeout to avoid rapid firing
      clearTimeout(resizeTimeout);
      
      // Set a small delay to capture final size after UI elements settle
      resizeTimeout = setTimeout(() => {
        const newHeight = window.innerHeight;
        
        // Only update if height changed significantly
        if (Math.abs(newHeight - lastHeight) > 50) {
          lastHeight = newHeight;
          updateHeight(drawerContent.classList.contains('fully-expanded'));
        }
      }, 50);
    };
    
    // Attach more specific event listeners for iOS
    if (isIOS && window.visualViewport) {
      // Modern iOS provides visualViewport API
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
    }
    
    // Attach standard event listeners
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', () => {
      // Orientation change needs a slightly longer delay
      setTimeout(handleResize, 300);
    });
    window.addEventListener('scroll', handleVisualViewportResize, { passive: true });
    
    if (innerContent) {
      innerContent.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Setup interval to catch edge cases
    const checkInterval = setInterval(() => {
      const newHeight = window.innerHeight;
      if (Math.abs(newHeight - lastHeight) > 20) {
        lastHeight = newHeight;
        updateHeight(drawerContent.classList.contains('fully-expanded'));
      }
    }, 500);
    
    // Clean up all event listeners
    return () => {
      if (isIOS && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportResize);
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', () => setTimeout(handleResize, 300));
      window.removeEventListener('scroll', handleVisualViewportResize);
      
      if (innerContent) {
        innerContent.removeEventListener('scroll', handleScroll);
      }
      
      clearInterval(checkInterval);
    };
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;

    const setDrawerHeight = () => {
      const vh = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      document.documentElement.style.setProperty('--drawer-viewport-height', `${vh}px`);
    };

    setDrawerHeight();

    window.addEventListener('resize', setDrawerHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setDrawerHeight);
      window.visualViewport.addEventListener('scroll', setDrawerHeight);
    }

    return () => {
      window.removeEventListener('resize', setDrawerHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setDrawerHeight);
        window.visualViewport.removeEventListener('scroll', setDrawerHeight);
      }
    };
  }, [selectedProject]);

  return (
    <>
      {/* Search and Filter Section */}
      <Container className="mb-10">
        <div className="relative">
          <Input
            placeholder="Search our work..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-16 rounded-full"
          />
          <div className="absolute right-1 top-1 flex gap-1">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mt-4">
          {loading ? (
            // Skeleton for category filters
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`cat-skeleton-${i}`} className="h-8 w-20 rounded-full" />
            ))
          ) : (
            categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))
          )}
        </div>
      </Container>

      {/* Projects Grid */}
      <Container>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skeletons}
          </div>
        ) : (
          <>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl">No projects found matching your search</h3>
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('Featured');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <div 
                    key={project._id}
                    className="group relative overflow-hidden rounded-lg cursor-pointer"
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentImageIndex(0);
                    }}
                  >
                    {/* Project Image */}
                    <div className="h-80 relative">
                      {project.featuredImage ? (
                        <Image
                          src={urlForImage(project.featuredImage).url()}
                          alt={project.title}
                          fill
                          priority={false}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <p className="text-muted-foreground">No image</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Project Info */}
                    <div className="mt-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {project.clientInfo?.clientName || ''}
                      </div>
                      <h3 className="text-xl font-heading font-medium mt-1">{project.title}</h3>
                      
                      {/* Tags */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.projectField && (
                          <Badge variant="outline" className="bg-background/80">{project.projectField.title}</Badge>
                        )}
                        {project.projectSector && (
                          <Badge variant="outline" className="bg-background/80">{project.projectSector.title}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Project Drawer - Full Screen Experience */}
        <Drawer 
          open={selectedProject !== null} 
          onOpenChange={(open) => {
            if (!open) setSelectedProject(null);
          }}
        >
          <DrawerContent className="drawer-override">
            {/* Added max-width container for desktop */}
            <div className="mx-auto w-full max-w-[1440px] drawer-container-override">
              <div className="overflow-y-auto p-6 sm:p-10">
                {/* Close Button */}
                <DrawerClose className="absolute right-4 top-4 z-50">
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
                
                {/* Featured Image */}
                {projectImages.length > 0 && (
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
                
                {/* Image Gallery */}
                {projectImages.length > 1 && (
                  <div className="mb-8">
                    <div className="flex flex-col space-y-6">

                      
                      {projectImages.slice(1).map((image, index) => (
                        <div 
                          key={index + 1}
                          className="relative cursor-pointer rounded-md overflow-hidden"
                          onClick={() => {
                            setCurrentImageIndex(index + 1);
                            setLightboxOpen(true);
                          }}
                        >
                          <div className="relative aspect-video w-full">
                            <Image
                              src={urlForImage(image).url()}
                              alt={`${selectedProject?.title} image ${index + 2}`}
                              fill
                              className="object-cover" // Removed hover:scale-105 transition-transform duration-300
                            />
                          </div>
                          {/* Fix the type casting for the image */}
                          {('caption' in image && (image as SanityImageWithCaption).caption) && (
                            <div className="p-3 bg-background/5 text-sm">
                              {(image as SanityImageWithCaption).caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Lightbox Dialog */}
        <Dialog 
          open={lightboxOpen} 
          onOpenChange={(open) => {
            if (!open) setLightboxOpen(false);
          }}
          modal={true}
        >
          <DialogContent 
            className="p-0 border-none bg-black/95 rounded-none m-0 overflow-hidden lightbox-content-override"
            style={{ 
              position: 'fixed',
              width: '100vw',
              height: '100vh',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: 'none !important',
              maxWidth: '100vw',
              maxHeight: '100vh',
              zIndex: 9999
            }}
            onKeyDown={handleKeyDown}
          >
            {projectImages.length > 0 && (
              <div 
                className="fixed inset-0 w-full h-full flex items-center justify-center"
                style={{ 
                  touchAction: 'pan-y',
                  transform: 'none !important' 
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => { touchStartX.current = null; }}
              >
                {/* Project info in top left */}
                <div className="absolute top-0 left-0 p-6 z-20 text-white">
                  <h3 className="text-xl font-medium">
                    {selectedProject?.title}
                  </h3>
                  {selectedProject?.clientInfo?.clientName && (
                    <p className="text-sm text-white/70">
                      {selectedProject.clientInfo.clientName}
                    </p>
                  )}
                </div>
                
                {/* Main image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={urlForImage(projectImages[currentImageIndex]).url()}
                    alt={`${selectedProject?.title} image ${currentImageIndex + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    unoptimized
                    priority
                  />
                </div>
                
                {/* Close Button - made larger and more prominent */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-4 z-50 bg-black/60 hover:bg-black/80 text-white h-10 w-10"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </Button>
                
                {/* Navigation buttons */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
                  <div className="flex space-x-4">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-black/40 hover:bg-black/60 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    <div className="bg-black/40 text-white px-3 py-1 rounded-full text-sm flex items-center">
                      {currentImageIndex + 1} / {projectImages.length}
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-black/40 hover:bg-black/60 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View All Projects Button */}
        <div className="mt-16 flex justify-center">
          <Button className="rounded-full" size="lg" variant="outline">
            View All Work
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2 h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </Container>
    </>
  );
}