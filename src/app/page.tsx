import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { Container } from "@/components/layout/container";
import { getProjects, getCategories, getHomePage } from "@/sanity/lib/queries";
import FeatureVideo from "@/components/FeatureVideo";
import { FormattedText } from "@/components/ui/FormattedText";

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function HomePage() {
  const homeData = await getHomePage();
  const projects = await getProjects();
  const categories = await getCategories();
  
  return (
    <main className="min-h-screen pb-16">
      {homeData?.featureVideo?.asset?.url && (
        <FeatureVideo 
          videoUrl={homeData.featureVideo.asset.url} 
          title={homeData.featureVideo?.title || "Create Your Vision"} 
          posterImage={homeData.featureVideo?.caption || ""}
        />
      )}
      
      {/* Subtitle Section with Formatted Text */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            {homeData?.subtitleText ? (
              <div className="text-2xl md:text-3xl lg:text-4xl leading-relaxed">
                <FormattedText value={homeData.subtitleText} />
              </div>
            ) : (
              <div className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-muted-foreground">
                From <span className="text-foreground font-medium">concept to creation</span>, we handle every stage of your digital presence. Whether you need a standout brand, a <span className="text-foreground font-medium">high-converting website</span>, or <span className="text-foreground font-medium">compelling video content</span>. We bring it all together <span className="text-foreground font-medium">under one creative roof</span>.
              </div>
            )}
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