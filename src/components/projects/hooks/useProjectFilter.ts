import { useState, useMemo } from "react";
import { Project } from "../types";

export const useProjectFilter = (projects: Project[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Featured");

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
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
  }, [projects, searchQuery, activeCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('Featured');
  };

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredProjects,
    clearFilters
  };
};