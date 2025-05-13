import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { getProjects } from "@/app/page";
import { client } from "@/sanity/lib/client"; 
import { Metadata } from 'next';
import { urlForImage } from "@/lib/image";
import { Container } from "@/components/layout/container";

interface PageProps {
  params: {
    slug: string;
  };
}

// Get project categories directly from the client
async function getProjectCategories() {
  const categories = await client.fetch(`
    *[_type == "category"]{
      title
    }
  `);
  return ["Featured", ...categories.map((cat: { title: string }) => cat.title)];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Fetch data for this specific project
  const projects = await getProjects();
  const project = projects.find(p => p.slug?.current === params.slug);
  
  if (!project) {
    return {
      title: 'Project Not Found'
    };
  }

  return {
    title: `${project.title} | Core Create`,
    description: project.description || `View details about ${project.title}`,
    openGraph: {
      title: project.title,
      description: project.description || `Project by Core Create`,
      images: project.featuredImage 
        ? [{ url: urlForImage(project.featuredImage).url() }] 
        : undefined
    },
  };
}

// Static generation for better performance
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map(project => ({
    slug: project.slug?.current || "",
  }));
}

// Use static rendering with revalidation for better performance
export const dynamic = 'force-static';
export const revalidate = 3600; 

export default async function ProjectPage({ params }: PageProps) {
  // Fetch all projects and categories
  const projects = await getProjects();
  const categories = await getProjectCategories();
  
  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section can be omitted here if you want - depends on your design */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold leading-tight">
              From <span className="text-primary">concept to creation</span>, we handle every stage of your 
              digital presence.
            </h1>
          </div>
        </Container>
      </section>

      {/* Projects Section */}
      <ProjectsGrid 
        projects={projects} 
        categories={categories} 
        loading={false}
        initialProjectSlug={params.slug} // Pass the slug to open the drawer immediately
      />
    </main>
  );
}