"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  // Add the new video fields
  featuredVideoEnabled?: boolean;
  featuredVideo?: {
    asset: {
      _ref: string;
      _type: string;
      url?: string;
    };
  };
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

// Add this new component at the top of your file, before the ProjectsGrid component

const ProjectThumbnailCarousel = ({ project }: { project: Project }) => {
  // Keep existing image collection code
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

  // Only create carousel if there are multiple images
  if (projectImages.length <= 1) {
    return (
      <Image
        src={urlForImage(project.featuredImage).url()}
        alt={project.title}
        fill
        priority={false}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    );
  }

  // State for current slide index and timer progress
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const interval = 5000; // 5 seconds per slide
  
  // Separate timers to avoid conflicts
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Touch/swipe handlers for mobile only
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchMoved = useRef(false);
  
  // Clear all timers - utility function
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
  
  // Update slide without timer interactions
  const updateSlide = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    setProgress(100); // Fill the bar for manual navigation
  }, []);
  
  // Navigation functions with timer cleanup
  const nextSlide = useCallback(() => {
    clearTimers();
    const newIndex = (currentIndex + 1) % projectImages.length;
    updateSlide(newIndex);
  }, [clearTimers, currentIndex, projectImages.length, updateSlide]);
  
  const prevSlide = useCallback(() => {
    clearTimers();
    const newIndex = (currentIndex - 1 + projectImages.length) % projectImages.length;
    updateSlide(newIndex);
  }, [clearTimers, currentIndex, projectImages.length, updateSlide]);


  // Setup the auto-advance timer - but keep it separate from navigation
  useEffect(() => {
    // First clear any existing timers
    clearTimers();
    
    // Don't start new timers if paused
    if (isPaused) return;
    
    // Progress update function - smooth animation
    const updateProgress = () => {
      const progressInterval = 50; // Update every 50ms
      const progressIncrement = (progressInterval / interval) * 100;
      
      progressTimerRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + progressIncrement;
          if (next >= 100) {
            // If we reach 100%, schedule the next slide
            if (!slideTimerRef.current) {
              slideTimerRef.current = setTimeout(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % projectImages.length);
                setProgress(0);
                slideTimerRef.current = null;
              }, 50); // Small delay to ensure progress bar is seen as full
            }
            return 100;
          }
          return next;
        });
      }, progressInterval);
    };
    
    // Reset progress when slide changes and start the new timer
    if (!isPaused) {
      setProgress(0);
      updateProgress();
    }
    
    // Clean up on unmount
    return clearTimers;
  }, [clearTimers, isPaused, interval, currentIndex, projectImages.length]);

  // Add state to track horizontal swipe
  const [isHorizontalSwiping, setIsHorizontalSwiping] = useState(false);
  
  // Improved touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].pageY;
    // Important: add a flag to track if we've moved significantly
    touchMoved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].pageY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    
    // CRITICAL: Check direction EARLY and prevent default IMMEDIATELY for horizontal moves
    if (Math.abs(diffX) > Math.abs(diffY) * 1.1) {
      // This is likely a horizontal swipe - prevent ALL scrolling immediately
      e.preventDefault();
      touchMoved.current = true;
      
      // If we haven't already set horizontal swiping state
      if (!isHorizontalSwiping) {
        setIsHorizontalSwiping(true);
        
        // Apply stronger scroll prevention
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed'; // This is key - fix the body position
        document.body.style.width = '100%';     // Maintain width
        document.body.style.top = `-${window.scrollY}px`; // Remember scroll position
        document.body.style.touchAction = 'none';
      }
      
      // Navigation logic for significant movement
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
  };

  const handleTouchEnd = () => { 
    // Remember scroll position before resetting
    const scrollY = document.body.style.top ? parseInt(document.body.style.top || '0') * -1 : 0;
    
    touchStartX.current = null;
    touchStartY.current = null;
    
    if (isHorizontalSwiping) {
      // Restore normal scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.touchAction = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    }
    
    setIsHorizontalSwiping(false);
  };

  // Add a check for mobile devices
  const isMobile = useRef(false);
  
  // Check if mobile on component mount
  useEffect(() => {
    // Simple mobile detection
    isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Return your component with updated event handlers and CSS
return (
  <div 
    className="w-full h-full relative select-none"
    style={{ 
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      touchAction: 'pan-y', // Allow vertical panning by default
      overscrollBehaviorX: 'none',
      overscrollBehaviorY: isHorizontalSwiping ? 'none' : 'auto',
      WebkitOverflowScrolling: 'touch', // Smoother scrolling on iOS
    }}
    // Mark this event as passive: false for iOS Safari
    onTouchStart={handleTouchStart}
    onTouchMove={(e) => {
      // Using the non-passive handler technique
      if (touchStartX.current) {
        e.stopPropagation();
        // iOS Safari needs this non-passive approach
        handleTouchMove(e);
      }
    }}
    onTouchEnd={handleTouchEnd}
    onMouseEnter={() => {
      // Only enable hover behavior on non-mobile devices
      if (!isMobile.current) {
        setIsPaused(true);
        setShowControls(true);
      }
    }}
    onMouseLeave={() => {
      // Only enable hover behavior on non-mobile devices
      if (!isMobile.current) {
        setIsPaused(false);
        setShowControls(false);
      }
    }}
  >
      {/* Arrow controls for desktop - only show on hover AND only on non-mobile */}
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

      {/* Progress bars at the BOTTOM with new colors */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex gap-1 p-2">
        {projectImages.map((_, idx) => (
          <div key={idx} className="h-1 bg-black/40 rounded-full flex-1">
            {idx === currentIndex && (
              <div 
                className="h-full bg-[#BAFF00] rounded-full transition-all duration-100" 
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Current image */}
      <Image
        src={urlForImage(projectImages[currentIndex]).url()}
        alt={project.title}
        fill
        priority={true}
        className="object-cover transition-transform duration-300 group-hover:scale-105 carousel-image-container"
        draggable={false}
      />
    </div>
  );
};

export function ProjectsGrid({ projects, categories, loading }: ProjectsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


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
    
    // Always add featured image to the gallery, regardless of video
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

  // Replace ALL existing drawer-related useEffect hooks with these two:

  // 1. Safari URL bar detection and handling
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
  
  // 2. Drawer expansion on scroll
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

  // CHANGE THESE NAMES to avoid collision with the carousel functions
  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
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
                    {/* Project Image or Video */}
                    <div className="h-80 relative">
                      {project.featuredVideoEnabled && project.featuredVideo?.asset?.url ? (
                        <video
                          src={project.featuredVideo.asset.url}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="object-cover w-full h-full"
                          style={{ objectFit: "cover" }}
                        />
                      ) : project.featuredImage ? (
                        <ProjectThumbnailCarousel project={project} />
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
                      {projectImages.slice(1).map((image, index) => (
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
                              alt={image.caption || `${selectedProject?.title} image ${index + 2}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {image.caption && (
                            <p className="text-sm text-muted-foreground mt-1 px-2 pb-2">
                              {image.caption}
                            </p>
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
                onTouchStart={handleLightboxTouchStart}
                onTouchMove={handleLightboxTouchMove}
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