import { Project } from "../types"; // Fixed: Remove unused SanityImage import

/**
 * Gets all images for a project, combining featured image and gallery
 */
export const getAllProjectImages = (project: Project | null) => {
  if (!project) return [];
  
  const images = [];
  
  // Always add featured image to the gallery, regardless of video
  if (project.featuredImage) {
    images.push(project.featuredImage);
  }
  
  // Add gallery images if they exist
  if (project.gallery?.images && project.gallery.images.length > 0) {
    images.push(...project.gallery.images);
  }
  
  return images;
};

/**
 * Gets adjacent image indices for preloading
 */
export const getAdjacentIndices = (currentIndex: number, totalImages: number) => {
  const prev = (currentIndex - 1 + totalImages) % totalImages;
  const next = (currentIndex + 1) % totalImages;
  return { prev, next };
};