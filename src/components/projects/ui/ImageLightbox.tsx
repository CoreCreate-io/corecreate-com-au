import React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { urlForImage } from "@/lib/image";
import { Project, SanityImage, SanityImageWithCaption } from "../types";
import "../ProjectsOverride.css";

interface ImageLightboxProps {
  selectedProject: Project | null;
  lightboxOpen: boolean;
  setLightboxOpen: (open: boolean) => void;
  projectImages: Array<SanityImage | SanityImageWithCaption>;
  currentImageIndex: number;
  nextImage: () => void;
  prevImage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleLightboxTouchStart: (e: React.TouchEvent) => void;
  handleLightboxTouchMove: (e: React.TouchEvent) => void;
  touchStartX: React.RefObject<number | null>;
}

export const ImageLightbox = ({
  selectedProject,
  lightboxOpen,
  setLightboxOpen,
  projectImages,
  currentImageIndex,
  nextImage,
  prevImage,
  handleKeyDown,
  handleLightboxTouchStart,
  handleLightboxTouchMove,
  touchStartX
}: ImageLightboxProps) => {
  return (
    <div className="cc-lightbox-dialog-wrapper">
      <Dialog 
        open={lightboxOpen} 
        onOpenChange={(open) => {
          if (!open) setLightboxOpen(false);
        }}
        modal={true}
      >
        <DialogContent 
          className="cc-lightbox-content"
          onKeyDown={handleKeyDown}
          style={{
            position: 'fixed',
            inset: '0',
            transform: 'none',
            translate: 'none',
            maxWidth: '100vw',
            maxHeight: '100vh',
            margin: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          {projectImages.length > 0 && (
            <div 
              className="cc-lightbox-container" // Updated class name
              style={{ transform: 'none', translate: 'none' }} // Add this style attribute
              onTouchStart={handleLightboxTouchStart}
              onTouchMove={handleLightboxTouchMove}
              onTouchEnd={() => { touchStartX.current = null; }}
            >
              {/* Project info in top left */}
              <div className="cc-lightbox-info"> {/* Updated class name */}
                <h3 className="text-xl font-medium">
                  {selectedProject?.title}
                </h3>
                {selectedProject?.clientInfo?.clientName && (
                  <p className="text-sm text-white/70">
                    {selectedProject.clientInfo.clientName}
                  </p>
                )}
              </div>
              
              {/* Main image */}
              <div className="cc-lightbox-image-wrapper"> {/* Updated class name */}
                <Image
                  src={urlForImage(projectImages[currentImageIndex]).url()}
                  alt={`${selectedProject?.title} image ${currentImageIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="cc-lightbox-image" // Updated class name
                  unoptimized
                  priority
                />
              </div>
              
              {/* Close Button */}
              <Button
                variant="secondary" 
                size="icon"
                className="cc-lightbox-close-btn" // Updated class name
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
              
              {/* Navigation buttons */}
              <div className="cc-lightbox-navigation"> {/* Updated class name */}
                <div className="flex space-x-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="cc-lightbox-nav-btn" // Updated class name
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="cc-lightbox-counter"> {/* Updated class name */}
                    {currentImageIndex + 1} / {projectImages.length}
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    className="cc-lightbox-nav-btn" // Updated class name
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};