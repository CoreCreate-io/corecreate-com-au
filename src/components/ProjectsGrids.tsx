"use client";

import { useState } from "react";
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

// Update your Project interface to match the actual schema structure
export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  featuredImage: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
  // Match your actual schema structure
  gallery?: {
    images?: Array<{
      _key: string;
      _type: string;
      asset: {
        _ref: string;
        _type: string;
      };
      alt?: string;
      caption?: string;
    }>;
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
          <DrawerContent className="h-[95vh] max-h-[95vh]">
            <div className="h-full overflow-y-auto p-6 sm:p-10">
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
                      className="object-cover"
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
                  <h3 className="text-xl font-medium mb-4">Project Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {projectImages.map((image, index) => (
                      <div 
                        key={index}
                        className="aspect-square relative cursor-pointer rounded-md overflow-hidden"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <Image
                          src={urlForImage(image).url()}
                          alt={`${selectedProject?.title} image ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Lightbox Dialog */}
        <Dialog 
          open={lightboxOpen} 
          onOpenChange={setLightboxOpen}
        >
          <DialogContent 
            className="sm:max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90"
            onKeyDown={handleKeyDown}
          >
            {projectImages.length > 0 && (
              <div className="relative h-[90vh] w-full flex items-center justify-center">
                <div className="relative h-full w-full flex items-center justify-center">
                  <Image
                    src={urlForImage(projectImages[currentImageIndex]).url()}
                    alt={`${selectedProject?.title} image ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
                
                {/* Navigation Buttons */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 rounded-full bg-black/20 hover:bg-black/40" 
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 rounded-full bg-black/20 hover:bg-black/40" 
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </Button>
                
                {/* Close Button */}
                <DrawerClose className="absolute right-4 top-4 text-white">
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </DrawerClose>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {projectImages.length}
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