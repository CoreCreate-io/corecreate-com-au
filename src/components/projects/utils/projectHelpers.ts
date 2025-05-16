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
  
  // Add gallery images if they exist - handle the correct structure
  if (project.gallery && project.gallery.images && Array.isArray(project.gallery.images)) {
    project.gallery.images.forEach(img => {
      if (img) images.push(img);
    });
  }
  
  console.log("Extracted images:", images.length);
  return images;
}