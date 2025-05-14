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
  // NEW: Calculate which categories have projects
  const nonEmptyCategories = useMemo(() => {
    if (!projects || !projects.length) return DEFAULT_CATEGORIES;
    
    const categoriesWithProjects = categories.filter(category => {
      // Skip processing the 'featured' category since it's handled differently
      if (category.slug?.current === 'featured') return true;
      
      // Check if there's at least one project associated with this category
      return projects.some(project => {
        // For main creative fields
        if (project.projectField?.title === category.title) return true;
        
        // For sectors
        if (project.projectSector?.title === category.title) return true;
        
        // For subcategories (if present)
        if (project.subCategories?.some(subCat => subCat.title === category.title)) return true;
        
        return false;
      });
    });
    
    // Ensure featured is always included (if it has projects)
    const featuredCategory = DEFAULT_CATEGORIES[0];
    const hasFeatured = categoriesWithProjects.some(c => c.slug?.current === 'featured') ||
                        projects.some(p => p.featured === true);
    
    return hasFeatured 
      ? (categoriesWithProjects.some(c => c.slug?.current === 'featured') 
        ? categoriesWithProjects 
        : [featuredCategory, ...categoriesWithProjects])
      : categoriesWithProjects;
  }, [projects, categories]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('featured');

  // Debug logging
  useEffect(() => {
    console.log('Active category:', activeCategory);
    console.log('Non-empty categories:', nonEmptyCategories.length);
  }, [activeCategory, nonEmptyCategories]);

  // Filter projects based on search query and category
  const filteredProjects = useMemo(() => {
    if (!projects || !projects.length) return [];
    
    let filtered = [...projects];
    
    // Special case for featured
    if (activeCategory === 'featured') {
      filtered = filtered.filter(project => project.featured === true);
      return filtered;
    } 
    
    // Only proceed with category filtering if we have valid categories
    if (nonEmptyCategories.length > 0) {
      const selectedCategory = nonEmptyCategories.find(c => c?.slug?.current === activeCategory);
      
      if (selectedCategory) {
        console.log('Filtering by category:', selectedCategory.title);
        
        filtered = filtered.filter(project => {
          // Check if the project's main field matches
          if (project.projectField?.title === selectedCategory.title) {
            return true;
          }
          
          // Check if it's a sector match
          if (project.projectSector?.title === selectedCategory.title) {
            return true;
          }

          // No match found
          return false;
        });
      }
    }
    
    return filtered;
  }, [projects, activeCategory, nonEmptyCategories]);

  // Search filtering
  const searchFilteredProjects = useMemo(() => {
    if (!searchQuery) return filteredProjects;
    
    const query = searchQuery.toLowerCase();
    return filteredProjects.filter(project => {
      const titleMatch = project.title?.toLowerCase().includes(query);
      const descMatch = project.description?.toLowerCase().includes(query);
      const fieldMatch = project.projectField?.title?.toLowerCase().includes(query);
      const sectorMatch = project.projectSector?.title?.toLowerCase().includes(query);
      
      // Add subcategory matching for search
      const subCategoryMatch = project.subCategories?.some(
        subCat => subCat.title?.toLowerCase().includes(query)
      );
      
      return titleMatch || descMatch || fieldMatch || sectorMatch || subCategoryMatch;
    });
  }, [filteredProjects, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredProjects: searchFilteredProjects,
    // IMPORTANT: Return the non-empty categories for use in the UI
    visibleCategories: nonEmptyCategories,
    clearFilters: () => {
      setSearchQuery('');
      setActiveCategory('featured');
    }
  };
}