import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/container";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  categories: string[];
  loading: boolean;
}

export const SearchFilters = ({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  loading
}: SearchFiltersProps) => {
  return (
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
  );
};