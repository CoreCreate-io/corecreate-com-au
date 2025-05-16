"use client";

import React, { useEffect, useState } from "react";
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
import ErrorBoundary from "./components/ErrorBoundary";
import { useInView } from 'react-intersection-observer';

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
  // Initialize state with provided projects
  const [allProjects, setAllProjects] = useState(projects);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Use the combined projects for filtering, etc.
  const { 
    searchQuery, setSearchQuery, 
    activeCategory, setActiveCategory,
    filteredProjects, visibleCategories, clearFilters 
  } = useProjectFilter(allProjects, categories);  // Use allProjects instead of projects
  
  // Project drawer state and logic
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Get project images for the selected project
  const projectImages = selectedProject ? getAllProjectImages(selectedProject) : [];
  
  // Image lightbox state
  const {
    lightboxOpen, setLightboxOpen,
    currentImageIndex, setCurrentImageIndex,
    nextImage, prevImage,
    handleKeyDown, handleLightboxTouchStart, handleLightboxTouchMove, touchStartX
  } = useLightbox(projectImages.length);

  // Create skeleton placeholders for loading state
  const skeletons = Array.from({ length: 4 }).map((_, i) => (
    <ProjectSkeleton key={`skeleton-${i}`} />
  ));

  // Keep your intersection observer for lazy loading more
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Load more projects when bottom element comes into view
  useEffect(() => {
    const loadMore = async () => {
      if (!inView || isLoadingMore || !hasMore) return;
      
      try {
        setIsLoadingMore(true);
        const skip = page * 8; // 8 projects per page
        const moreProjects = await fetch(`/api/projects?skip=${skip}&limit=8`).then(r => r.json());
        
        if (moreProjects.length === 0) {
          setHasMore(false);
        } else {
          setAllProjects(prev => [...prev, ...moreProjects]);
          setPage(p => p + 1);
        }
      } catch (error) {
        console.error("Error loading more projects:", error);
      } finally {
        setIsLoadingMore(false);
      }
    };
    
    loadMore();
  }, [inView, page, isLoadingMore, hasMore]);

  return (
    <ErrorBoundary>
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard 
                      key={project._id} 
                      project={project} 
                      onClick={setSelectedProject} 
                    />
                  ))}
                </div>
                
                {/* Load more trigger */}
                {hasMore && (
                  <div ref={ref} className="h-20 flex items-center justify-center mt-8">
                    {isLoadingMore && (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        {/* Project Drawer */}
        <ProjectDrawer
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
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
    </ErrorBoundary>
  );
}