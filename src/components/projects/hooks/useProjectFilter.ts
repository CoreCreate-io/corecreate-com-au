import { useState, useEffect, useMemo } from 'react';
import { Project, Category } from '../types';

export function useProjectFilter(projects: Project[], categories: Category[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('featured');

  // Filter projects based on search query and category
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let filtered = [...projects];

    // Special case for featured
    if (activeCategory === 'featured') {
      filtered = filtered.filter(project => project.featured === true);
    } 
    // Filter by other categories
    else {
      filtered = filtered.filter(project => {
        // Find the selected category object
        const selectedCategory = categories.find(c => c.slug?.current === activeCategory);
        if (!selectedCategory) return false;
        
        // FIXED: Check if project field title matches selected category title
        const fieldMatches = project.projectField?.title === selectedCategory.title;
        
        // FIXED: Check if project sector title matches selected category title
        const sectorMatches = project.projectSector?.title === selectedCategory.title;
        
        return fieldMatches || sectorMatches;
      });
    }

    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => {
        // Check project title and description
        const titleMatches = project.title?.toLowerCase().includes(query) || false;
        const descMatches = project.description?.toLowerCase().includes(query) || false;
        
        // FIXED: Check field category by title directly
        const fieldMatches = project.projectField?.title?.toLowerCase().includes(query) || false;
        
        // FIXED: Check sector category by title directly
        const sectorMatches = project.projectSector?.title?.toLowerCase().includes(query) || false;
        
        // Check custom tags
        const tagMatches = project.customTags?.some(tag => 
          tag.toLowerCase().includes(query)
        ) || false;
        
        return titleMatches || descMatches || fieldMatches || sectorMatches || tagMatches;
      });
    }

    return filtered;
  }, [projects, searchQuery, activeCategory, categories]);

  // Reset filters
  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('featured');
  };

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredProjects,
    clearFilters
  };
}