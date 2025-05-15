"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Project, Category } from "./types";
import { SearchFilters } from "./ui/SearchFilters";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectSkeleton } from "./ui/ProjectSkeleton";
import { ImageLightbox } from "./ui/ImageLightbox";
import { useProjectFilter } from "./hooks/useProjectFilter";
import { useLightbox } from "./hooks/useLightbox";
import { useProjectNavigation } from "./hooks/useProjectNavigation";
import { getAllProjectImages } from "./utils/projectHelpers";
import "./ProjectsOverride.css";
import dynamic from 'next/dynamic'

// Replace your direct import with this dynamic import
const ProjectDrawer = dynamic(
  () => import('./ui/ProjectDrawer').then(mod => mod.default),
  { 
    loading: () => <div className="loading-placeholder">Loading project...</div>,
    ssr: false // If this component uses browser APIs like window
  }
)

interface ProjectsGridProps {
  projects: Project[];
  categories: Category[];
  loading: boolean;
  initialProjectSlug?: string;
}

export function ProjectsGrid({ projects = [], categories = [], loading, initialProjectSlug }: ProjectsGridProps) {
  // Add debugging for categories
  useEffect(() => {
    console.log("ProjectsGrid received categories:", categories);
  }, [categories]);

  // Only initialize filter when data is available
  const { 
    searchQuery, setSearchQuery, 
    activeCategory, setActiveCategory,
    filteredProjects, visibleCategories, // Get this from the hook
    clearFilters 
  } = useProjectFilter(projects, categories);
  
  // Project navigation and URL handling
  const {
    selectedProject,
    isClosing,
    selectProject,
    closeProject
  } = useProjectNavigation(initialProjectSlug, projects);
  
  // Get project images
  const projectImages = getAllProjectImages(selectedProject);
  
  // Lightbox functionality
  const {
    lightboxOpen, setLightboxOpen,
    currentImageIndex, setCurrentImageIndex,
    nextImage, prevImage, handleKeyDown,
    handleLightboxTouchStart, handleLightboxTouchMove, touchStartX
  } = useLightbox(projectImages.length);

  // Create skeleton placeholders for loading state
  const skeletons = Array.from({ length: 4 }).map((_, i) => (
    <ProjectSkeleton key={`skeleton-${i}`} />
  ));

  return (
    <>
      {/* Search and Filter Section */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
        visibleCategories={visibleCategories} // Pass this to SearchFilters
        loading={loading}
      />

      {/* Projects Grid */}
      <Container>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{skeletons}</div>
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
                    onClick={selectProject} 
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Project Drawer */}
        <ProjectDrawer
          selectedProject={selectedProject}
          setSelectedProject={closeProject}
          projectImages={projectImages}
          setCurrentImageIndex={setCurrentImageIndex}
          setLightboxOpen={setLightboxOpen}
          isClosing={isClosing}
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
      </Container>
    </>
  );
}