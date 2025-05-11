"use client";

import { useState, useEffect } from "react";
import { client } from "@/lib/sanity.client";
import { Container } from "@/components/layout/container";
import { ProjectsGrid, Project } from "@/components/ProjectsGrids";

interface Category {
  title: string;
  categoryType: string;
}

export default function Home() {
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
            gallery{images, display, zoom},  // This is the correct way to query the nested structure
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

      {/* Projects Section */}
      <ProjectsGrid 
        projects={projects} 
        categories={categories} 
        loading={loading} 
      />
    </main>
  );
}