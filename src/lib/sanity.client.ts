import { createClient } from 'next-sanity';
import { groq } from 'next-sanity';

// Define these directly if they're not available from an env file
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = '2023-05-03'; // Use a specific date for stability

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
});

// Function to fetch all projects
export async function getProjects() {
  return client.fetch(
    groq`*[_type == "project"] | order(order asc) {
      _id,
      title,
      slug,
      description,
      featuredImage,
      projectField->{title, slug},
      projectSector->{title, slug},
      clientInfo->{clientName, clientUrl},
      featuredVideo,
      featuredVideoEnabled,
      galleries,
      featuredImage,
      order
    }`
  );
}

// Function to fetch project categories
export async function getProjectCategories() {
  return client.fetch(
    groq`*[_type == "projectField"] | order(title asc) {
      _id,
      title,
      slug
    }`
  );
}

// Function to fetch a specific project by slug
export async function getProjectBySlug(slug: string) {
  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      featuredImage,
      projectField->{title, slug},
      projectSector->{title, slug},
      clientInfo->{clientName, clientUrl},
      featuredVideo,
      featuredVideoEnabled,
      galleries,
      featuredImage,
      order
    }`,
    { slug }
  );
}