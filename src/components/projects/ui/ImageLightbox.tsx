import React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { urlForImage } from "@/lib/image";
import { Project, SanityImage, SanityImageWithCaption } from "../types";

interface ImageLightboxProps {
  selectedProject: Project | null;
  lightboxOpen: boolean;
  setLightboxOpen: (open: boolean) => void;
  projectImages: Array<SanityImage | SanityImageWithCaption>; // Fixed: Replace 'any' with proper type
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
    <Dialog 
      open={lightboxOpen} 
      onOpenChange={(open) => {
        if (!open) setLightboxOpen(false);
      }}
      modal={true}
    >
      <DialogContent 
        className="p-0 border-none bg-black/95 rounded-none m-0 overflow-hidden lightbox-content-override"
        style={{ 
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: 'none !important',
          maxWidth: '100vw',
          maxHeight: '100vh',
          zIndex: 9999
        }}
        onKeyDown={handleKeyDown}
      >
        {projectImages.length > 0 && (
          <div 
            className="fixed inset-0 w-full h-full flex items-center justify-center"
            style={{ 
              touchAction: 'pan-y',
              transform: 'none !important' 
            }}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={() => { touchStartX.current = null; }}
          >
            {/* Project info in top left */}
            <div className="absolute top-0 left-0 p-6 z-20 text-white">
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
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={urlForImage(projectImages[currentImageIndex]).url()}
                alt={`${selectedProject?.title} image ${currentImageIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            
            {/* Close Button */}
            <Button
              variant="secondary" 
              size="icon"
              className="absolute right-4 top-4 z-50 bg-black/60 hover:bg-black/80 text-white h-10 w-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </Button>
            
            {/* Navigation buttons */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-black/40 hover:bg-black/60 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="bg-black/40 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  {currentImageIndex + 1} / {projectImages.length}
                </div>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-black/40 hover:bg-black/60 text-white"
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
  );
};