import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/container";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Category } from "../types";
import { urlForImage } from "@/sanity/lib/image";

// Import your CSS with the filter styles
import "../components/css/ProjectsOverride.css";

// Same props interface
interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  categories: Category[];
  visibleCategories?: Category[];
  loading: boolean;
}

export function SearchFilters({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  visibleCategories,
  loading
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(true);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCategoryClick = (categorySlug: string) => {
    console.log('Clicked category slug:', categorySlug);
    setActiveCategory(categorySlug || '');
  };

  const categoriesToShow = visibleCategories || categories;

  return (
    <Container className="mb-1">
      {/* Search Bar - stays constrained */}
      <div className="relative">
        <Input
          placeholder="Search our work"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-24 pl-5 h-12 text-base rounded-full border-gray-200 shadow-sm"
        />
        <div className="absolute right-2 top-1.5 flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-9 w-9 border-gray-200"
            onClick={toggleFilters}
          >
            <Filter className="h-5 w-5 text-gray-500" />
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            className="rounded-full h-9 w-9"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Category Filters with edge-to-edge scrolling on mobile */}
      {showFilters && (
        <div className="mt-4 filter-grid-override">
          {loading ? (
            // Skeleton for category filters
            <div className="filter-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={`cat-skeleton-${i}`} className="filter-item h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            // The key change is here - negative margins on mobile only
            <div className="-mx-4 sm:-mx-6 md:mx-0">
              <ScrollArea className="w-full pb-2">
                {/* Add padding to inner content to match the negative margin */}
                <div className="filter-container flex space-x-2 px-4 sm:px-6 md:px-0">
                  {categoriesToShow
                    .filter(category => 
                      category.categoryType === 'creativeField' || 
                      category.slug?.current === 'featured'
                    )
                    .map((category) => {
                      const isActive = activeCategory === category.slug?.current;
                      return (
                        <div 
                          key={category._id}
                          className="filter-item rounded-lg cursor-pointer transition-all hover:shadow-lg overflow-hidden"
                          onClick={() => handleCategoryClick(category.slug?.current || '')}
                        >
                          {/* Restructured for proper layering */}
                          <div className="relative h-[60px] rounded-lg overflow-hidden">
                            {/* 1. Background image layer */}
                            {category.featuredImage && (
                              <div className="absolute inset-0">
                                <Image
                                  src={urlForImage(category.featuredImage).url()}
                                  alt=""
                                  fill
                                  sizes="(max-width: 768px) 150px, 200px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            
                            {/* 2. Dark overlay layer - separate from image */}
                            <div 
                              className={`absolute inset-0 ${
                                isActive ? 'bg-[#BAFF00]/80' : 'bg-black/50'
                              }`}
                            ></div>
                            
                            {/* 3. Content layer */}
                            <div className="relative h-full flex items-center justify-center px-4 z-10">
                              <h3 className={`font-medium text-xs whitespace-nowrap ${isActive ? 'text-black' : 'text-white'}`}>
                                {category.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="lg:hidden" />
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}