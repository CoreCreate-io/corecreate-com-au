"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/sanity.client";
import { urlForImage } from "@/lib/image";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

// Types based on your Sanity schema
interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  featuredImage: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
  projectField: { title: string };
  projectSector: { title: string };
  clientInfo?: { 
    clientName?: string;
  };
  featured?: boolean;
}

interface Category {
  title: string;
  categoryType: string;
}

// Component for project skeleton during loading
const ProjectSkeleton = () => (
  <div className="group relative overflow-hidden rounded-lg">
    <Skeleton className="h-80 w-full" />
    <div className="mt-3">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-6 w-full max-w-[250px]" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(["Featured"]);
  const [loading, setLoading] = useState(true);

  // Fetch projects and categories from Sanity
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        // Fetch projects with their fields and sectors
        const projectsData = await client.fetch(`
          *[_type == "project"] | order(publishedAt desc) {
            _id,
            title,
            slug,
            description,
            featuredImage,
            projectField->{title},
            projectSector->{title},
            clientInfo,
            featured
          }
        `);
        
        // Fetch unique field and sector categories
        const categoriesData = await client.fetch(`
          *[_type == "category"] | order(order asc) {
            title,
            categoryType
          }
        `);
        
        // Extract unique category titles and add "Featured" at the beginning
        const categoryTitles: string[] = categoriesData.map((cat: Category) => cat.title);
        const uniqueCategories: string[] = ["Featured", ...new Set(categoryTitles)];

        // Set state after both requests complete
        setProjects(projectsData);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching data from Sanity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Filter projects based on search query and active category
  const filteredProjects = projects.filter(project => {
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

  // Create an array of skeleton placeholders for loading state
  const skeletons = Array.from({ length: 4 }).map((_, i) => <ProjectSkeleton key={`skeleton-${i}`} />);

  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold leading-tight">
              From <span className="text-primary">concept to creation</span>, we handle every stage of your 
              digital presence. Whether you need a standout <span className="text-primary">brand</span>, a 
              <span className="text-primary"> high-converting website</span>, or 
              <span className="text-primary"> compelling video content</span>.
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              We bring it all together <span className="font-medium text-foreground">under one creative roof</span>.
            </p>
          </div>
        </Container>
      </section>

      {/* Search and Filter Section */}
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
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('Featured');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <Link href={`/projects/${project.slug.current}`} key={project._id}>
                    <div className="group relative overflow-hidden rounded-lg">
                      {/* Project Image */}
                      <div className="h-80 relative">
                        {project.featuredImage ? (
                          <Image
                            src={urlForImage(project.featuredImage).url()}
                            alt={project.title}
                            fill
                            priority={false}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <p className="text-muted-foreground">No image</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Project Info */}
                      <div className="mt-3">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          {project.clientInfo?.clientName || ''}
                        </div>
                        <h3 className="text-xl font-heading font-medium mt-1">{project.title}</h3>
                        
                        {/* Tags */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.projectField && (
                            <Badge variant="outline" className="bg-background/80">{project.projectField.title}</Badge>
                          )}
                          {project.projectSector && (
                            <Badge variant="outline" className="bg-background/80">{project.projectSector.title}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* View All Projects Button */}
        <div className="mt-16 flex justify-center">
          <Button className="rounded-full" size="lg" variant="outline" asChild>
            <Link href="/projects">
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
            </Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}