import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/container";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Category } from "../types";
import { urlForImage } from "@/lib/image";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  categories: Category[];
  loading: boolean;
}


export function SearchFilters({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  loading
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(true);

  // Handle filter toggle
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle category click
  const handleCategoryClick = (categorySlug: string) => {
    console.log('Clicked category slug:', categorySlug);
    setActiveCategory(categorySlug || '');
  };

  return (
    <Container className="mb-10">
      {/* Search Bar */}
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
      
      {/* Category Filters */}
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
            
            // Inside your categories.map function:
            <ScrollArea className="w-full pb-2">
              <div className="filter-container flex space-x-3">
                {categories
                  .filter(category => 
                    category.categoryType === 'creativeField' || 
                    category.slug?.current === 'featured'
                  )
                  .map((category) => {
                    const isActive = activeCategory === category.slug?.current;
                    return (
                      <div 
                        key={category._id}
                        className="filter-item relative overflow-hidden rounded-lg cursor-pointer 
                          transition-all hover:shadow-lg"
                        onClick={() => handleCategoryClick(category.slug?.current || '')}
                      >
                        {/* Content-based width container */}
                        <div className="bg-gray-200 relative">
                          {category.featuredImage ? (
                            <Image
                              src={urlForImage(category.featuredImage).url()}
                              alt={category.title}
                              fill
                              sizes="(max-width: 768px) 150px, 200px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                          )}
                          
                          {/* Dark overlay */}
                          <div className={`absolute inset-0 transition-colors duration-200 ${
                            isActive 
                              ? 'bg-[#BAFF00]/80'
                              : 'bg-black/70'
                          }`}></div>
                          
                          {/* Category name - with content-based sizing */}
                          <div className="flex items-center justify-center py-3 px-2 z-10">
                            <h3 className={`font-medium text-xs px-6 py-2 z-2 ${isActive ? 'text-black' : 'text-white'}`}>
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
          )}
        </div>
      )}
    </Container>
  );
}