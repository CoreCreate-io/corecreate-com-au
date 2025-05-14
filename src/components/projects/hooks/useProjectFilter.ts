import { useState, useEffect, useMemo } from 'react';
import { Project, Category } from '../types';

// Ensure we always have the featured category
const DEFAULT_CATEGORIES: Category[] = [
  { 
    _id: 'featured',
    title: 'Featured',
    slug: { current: 'featured' }
  }
];

export function useProjectFilter(projects: Project[] = [], categories: Category[] = []) {
  // Ensure we always have at least the featured category
  const allCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      console.log('No categories provided, using defaults');
      return DEFAULT_CATEGORIES;
    }
    
    // Check if featured is already included
    const hasFeatured = categories.some(c => c.slug?.current === 'featured');
    
    if (!hasFeatured) {
      return [DEFAULT_CATEGORIES[0], ...categories];
    }
    
    return categories;
  }, [categories]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('featured');

  // Debug logging
  useEffect(() => {
    console.log('Active category:', activeCategory);
    console.log('Categories available:', allCategories.length);
  }, [activeCategory, allCategories]);

  // Filter projects based on search query and category
  const filteredProjects = useMemo(() => {
    if (!projects || !projects.length) return [];
    
    let filtered = [...projects];
    
    // Special case for featured
    if (activeCategory === 'featured') {
      filtered = filtered.filter(project => project.featured === true);
      console.log('Featured projects count:', filtered.length);
      return filtered;
    } 
    
    // Only proceed with category filtering if we have valid categories
    if (allCategories.length > 0) {
      const selectedCategory = allCategories.find(c => c?.slug?.current === activeCategory);
      
      if (selectedCategory) {
        console.log('Filtering by category:', selectedCategory.title);
        
        filtered = filtered.filter(project => {
          const fieldMatch = project.projectField?.title === selectedCategory.title;
          const sectorMatch = project.projectSector?.title === selectedCategory.title;
          return fieldMatch || sectorMatch;
        });
      }
    }
    
    return filtered;
  }, [projects, activeCategory, allCategories]);

  // Search filtering
  const searchFilteredProjects = useMemo(() => {
    if (!searchQuery) return filteredProjects;
    
    const query = searchQuery.toLowerCase();
    return filteredProjects.filter(project => {
      const titleMatch = project.title?.toLowerCase().includes(query);
      const descMatch = project.description?.toLowerCase().includes(query);
      const fieldMatch = project.projectField?.title?.toLowerCase().includes(query);
      const sectorMatch = project.projectSector?.title?.toLowerCase().includes(query);
      
      return titleMatch || descMatch || fieldMatch || sectorMatch;
    });
  }, [filteredProjects, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredProjects: searchFilteredProjects,
    clearFilters: () => {
      setSearchQuery('');
      setActiveCategory('featured');
    }
  };
}