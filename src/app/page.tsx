import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { client } from "@/sanity/lib/client";
import { Container } from "@/components/layout/container";
import "./globals.css";

// Fetch projects with video data - make this reusable
export async function getProjects() {
  return await client.fetch(`
    *[_type == "project"]{
      _id,
      title,
      slug,
      description,
      featuredImage,
      featuredVideoEnabled,
      featuredVideo{
        asset->{
          url
        }
      },
      gallery,
      projectField->{title},
      projectSector->{title},
      clientInfo,
      featured
    }
  `);
}

// Fetch categories for filtering
export async function getCategories() {
  const categories = await client.fetch(`
    *[_type == "category"]{
      title
    }
  `);
  return ["Featured", ...categories.map((cat: { title: string }) => cat.title)];
}

// Add this to ensure content is fresh but not causing refreshes on every navigation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate content every hour

export default async function ProjectsPage() {
  const projects = await getProjects();
  const categories = await getCategories();
  
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
        loading={false} 
      />
    </main>
  );
}