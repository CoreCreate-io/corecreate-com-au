"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ProjectsGridProps, Project } from "./types";
import { SearchFilters } from "./ui/SearchFilters";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectSkeleton } from "./ui/ProjectSkeleton";
import { ProjectDrawer } from "./ui/ProjectDrawer";
import { ImageLightbox } from "./ui/ImageLightbox";
import { useProjectFilter } from "./hooks/useProjectFilter";
import { useLightbox } from "./hooks/useLightbox";
import { getAllProjectImages } from "./utils/projectHelpers";
import "./ProjectsOverride.css";

// Update ProjectsGrid.tsx props interface
interface ProjectsGridProps {
  projects: Project[];
  categories: string[];
  loading: boolean;
  initialProjectSlug?: string; // Add this prop
}

export function ProjectsGrid({ projects, categories, loading, initialProjectSlug }: ProjectsGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Add state to track if the user directly accessed a project URL
  const [isDirectAccess, setIsDirectAccess] = useState(false);
  
  // Project filtering
  const { 
    searchQuery, setSearchQuery, 
    activeCategory, setActiveCategory,
    filteredProjects, clearFilters 
  } = useProjectFilter(projects);
  
  // Project selection for drawer
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Get project images
  const projectImages = getAllProjectImages(selectedProject);
  
  // Lightbox functionality
  const {
    lightboxOpen, setLightboxOpen,
    currentImageIndex, setCurrentImageIndex,
    nextImage, prevImage, handleKeyDown,
    handleLightboxTouchStart, handleLightboxTouchMove, touchStartX
  } = useLightbox(projectImages.length);

  // Add state to track drawer closing animation
  const [isClosing, setIsClosing] = useState(false);

  // Add this near the top of your component to track the original path
  const [originalPath, setOriginalPath] = useState<string>('');

  // Check if user came directly to a project URL
  useEffect(() => {
    if (initialProjectSlug && !isClosing) {
      setIsDirectAccess(true);
      // Find the project with matching slug
      const projectFromUrl = projects?.find(p => p.slug?.current === initialProjectSlug);
      if (projectFromUrl && !selectedProject) {
        setSelectedProject(projectFromUrl);
        setCurrentImageIndex(0);
      }
    }
  }, [initialProjectSlug, projects, selectedProject, setCurrentImageIndex, isClosing]);

  // Handle URL-based project selection - for direct links
  useEffect(() => {
    // Only process if we're not in the middle of closing
    if (!isClosing) {
      // Check if pathname includes '/projects/' - this would match /projects/[slug]
      const pathSegments = pathname.split('/');
      if (pathSegments.length >= 3 && pathSegments[1] === 'projects') {
        const projectSlug = pathSegments[2];
        
        // Find the project with matching slug
        const projectFromUrl = projects?.find(p => p.slug?.current === projectSlug);
        if (projectFromUrl && !selectedProject) {
          setSelectedProject(projectFromUrl);
          setCurrentImageIndex(0);
          // If coming from URL, mark as direct access
          setIsDirectAccess(true);
        }
      }
    }
  }, [pathname, projects, selectedProject, setCurrentImageIndex, isClosing]);

  // Add this effect to capture the original path when a project is selected
  useEffect(() => {
    if (selectedProject && !originalPath) {
      setOriginalPath(pathname);
    }
  }, [selectedProject, pathname, originalPath]);

  // Handle project selection (regular browsing)
  const handleProjectSelect = (project: Project) => {
    // Update state first
    setSelectedProject(project);
    setCurrentImageIndex(0);
    
    // Update URL without causing navigation using history API directly
    if (project.slug?.current) {
      const newUrl = `/projects/${project.slug.current}`;
      window.history.replaceState(
        { ...window.history.state, as: newUrl, url: newUrl }, 
        '', 
        newUrl
      );
    }
  };

  // Special handling for project closing based on access method
  const handleProjectClose = () => {
    // First mark as closing to prevent any reopening
    setIsClosing(true);
    
    // Then null out the project
    setSelectedProject(null);
    
    // If direct access, wait for drawer animation to fully complete before navigation
    if (isDirectAccess) {
      setTimeout(() => {
        router.push('/projects'); // Always redirect to projects page for direct access
        // Reset states after navigation
        setTimeout(() => {
          setIsDirectAccess(false);
          setIsClosing(false);
          setOriginalPath(''); // Reset original path
        }, 500);
      }, 600);
    } else {
      // For normal browsing, check where we came from
      const returnPath = originalPath.includes('/projects') ? '/projects' : '/';
      
      // Update URL without causing navigation using history API directly
      window.history.replaceState(
        { ...window.history.state, as: returnPath, url: returnPath }, 
        '', 
        returnPath
      );
      
      // Reset states after animation completes
      setTimeout(() => {
        setIsClosing(false);
        setOriginalPath(''); // Reset original path
      }, 600);
    }
  };

  // Create an array of skeleton placeholders for loading state
  const skeletons = Array.from({ length: 4 }).map((_, i) => <ProjectSkeleton key={`skeleton-${i}`} />);

  return (
    <>
      {/* Search and Filter Section */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
        loading={loading}
      />

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
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project._id} 
                    project={project} 
                    onClick={handleProjectSelect} 
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* In ProjectsGrid.tsx where you render the drawer */}
        <ProjectDrawer
          selectedProject={selectedProject}
          setSelectedProject={handleProjectClose}
          projectImages={projectImages}
          setCurrentImageIndex={setCurrentImageIndex}
          setLightboxOpen={setLightboxOpen}
          isClosing={isClosing} // Add this prop
        />

        {/* Lightbox Dialog */}
        <ImageLightbox
          selectedProject={selectedProject}
          lightboxOpen={lightboxOpen}
          setLightboxOpen={setLightboxOpen}
          projectImages={projectImages}
          currentImageIndex={currentImageIndex}
          nextImage={nextImage}
          prevImage={prevImage}
          handleKeyDown={handleKeyDown}
          handleLightboxTouchStart={handleLightboxTouchStart}
          handleLightboxTouchMove={handleLightboxTouchMove}
          touchStartX={touchStartX}
        />

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