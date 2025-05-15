import { client } from "./client";
import { Project, Category } from "@/components/projects/types";

// ====== PROJECT QUERIES ======

/**
 * Fetch all projects with complete data
 */
export async function getProjects(): Promise<Project[]> {
  return await client.fetch(`
    *[_type == "project"]{
      _id,
      title,
      slug,
      description,
      "projectField": projectField->{_id, title, slug},
      "projectSector": projectSector->{_id, title, slug},
      "subCategories": subCategories[]->{ _id, title, slug },
      featured,
      featuredImage,
      featuredVideoEnabled,
      featuredVideo{
        asset->{
          url
        }
      },
      gallery,
      clientInfo
    }
  `);
}

/**
 * Fetch a single project by slug
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return await client.fetch(`
    *[_type == "project" && slug.current == $slug][0]{
      ...,
      "featuredImage": featuredImage,
      "gallery": gallery{
        "images": images[]{
          ...,
          "asset": asset->
        },
        display,
        zoom
      },
      "projectField": projectField->,
      "projectSector": projectSector->,
      "subCategories": subCategories[]->
    }
  `, { slug });
}

/**
 * Fetch featured projects only
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  return await client.fetch(`
    *[_type == "project" && featured == true]{
      _id,
      title,
      slug,
      description,
      "projectField": projectField->{_id, title, slug},
      "projectSector": projectSector->{_id, title, slug},
      featured,
      featuredImage,
    }
  `);
}

// ====== CATEGORY QUERIES ======

/**
 * Fetch all categories with complete data
 */
export async function getCategories(): Promise<Category[]> {
  const categories = await client.fetch(`
    *[_type == "category"] | order(order asc) {
      _id,
      title,
      slug,
      description,
      featuredImage,
      overlayColor,
      icon,
      categoryType
    }
  `);
  
  // Add Featured as the first category
  return [
    {
      _id: "featured", 
      title: "Featured",
      slug: { current: "featured" },
      overlayColor: "bg-blue-900/60",
      categoryType: "featured" // Add this for consistency
    },
    ...categories
  ];
}

/**
 * Fetch only Creative Field categories
 */
export async function getCreativeFieldCategories(): Promise<Category[]> {
  return await client.fetch(`
    *[_type == "category" && categoryType == "creativeField"] | order(order asc) {
      _id,
      title,
      slug,
      description,
      featuredImage,
      icon,
      categoryType
    }
  `);
}

/**
 * Fetch only Sector categories
 */
export async function getSectorCategories(): Promise<Category[]> {
  return await client.fetch(`
    *[_type == "category" && categoryType == "sector"] | order(order asc) {
      _id,
      title,
      slug,
      description,
      featuredImage,
      icon,
      categoryType
    }
  `);
}

/**
 * Fetch subcategories for a specific creative field
 */
export async function getSubcategoriesForField(fieldSlug: string): Promise<Category[]> {
  return await client.fetch(`
    *[_type == "category" && categoryType == "subCategory" && parentField->slug.current == $fieldSlug] | order(order asc) {
      _id,
      title,
      slug,
      description,
      featuredImage,
      icon,
      categoryType,
      "parentField": parentField->{ _id, title, slug }
    }
  `, { fieldSlug });
}

export async function getHomePage() {
  return await client.fetch(`
    *[_type == "homePage"][0]{
      pageTitle,
      featureVideo{
        asset->{
          url
        },
        title,
        caption
      },
      subtitleText,
      // Other fields...
    }
  `);
}