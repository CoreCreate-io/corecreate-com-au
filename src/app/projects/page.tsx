import { getProjects, getCategories } from "@/app/page";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { Container } from "@/components/layout/container";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Projects | Core Create',
  description: 'Explore our portfolio of digital projects across web, brand, and video production.'
};

// Use static rendering with revalidation for better performance
export const dynamic = 'force-static';
export const revalidate = 3600; 

export default async function ProjectsIndexPage() {
  const projects = await getProjects();
  const categories = await getCategories();
  
  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold leading-tight">
              Our <span className="text-primary">Projects</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Explore our diverse portfolio of work across digital, branding, and video.
            </p>
          </div>
        </Container>
      </section>

      {/* Projects Grid */}
      <ProjectsGrid 
        projects={projects} 
        categories={categories} 
        loading={false}
      />
    </main>
  );
}