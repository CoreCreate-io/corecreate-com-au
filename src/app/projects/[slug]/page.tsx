import { getProjects, getCategories } from "@/sanity/lib/queries";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { Container } from "@/components/layout/container";
import { Metadata } from 'next';

// Update metadata function to use Promise-based params
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Await the params Promise to get slug
  const resolvedParams = await params;
  
  return {
    title: 'Our Projects | Core Create',
    description: 'Explore our portfolio of digital projects across web, brand, and video production.'
  };
}

export const dynamic = 'force-static';
export const revalidate = 3600; 

// Update the page component to match Sanity's pattern
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await the params Promise to get slug
  const resolvedParams = await params;
  const projects = await getProjects();
  const categories = await getCategories();
  
  return (
    <main className="min-h-screen pb-16">
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

      <ProjectsGrid 
        projects={projects} 
        categories={categories} 
        loading={false}
        initialProjectSlug={resolvedParams.slug}
      />
    </main>
  );
}