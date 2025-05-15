import { Project } from "../types"; // Fixed: Remove unused SanityImage import

/**
 * Gets all images for a project, combining featured image and gallery
 */
export function getAllProjectImages(project: Project | null) {
  if (!project) return [];
  
  const images = [];
  
  // Add featured image if it exists
  if (project.featuredImage) {
    images.push(project.featuredImage);
  }
  
  // Add gallery images if they exist
  // The gallery is structured as project.gallery.images in the Sanity schema
  if (project.gallery?.images && Array.isArray(project.gallery.images)) {
    project.gallery.images.forEach(item => {
      if (item) images.push(item);
    });
  }
  
  return images;
}