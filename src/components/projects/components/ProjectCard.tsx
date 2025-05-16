import React from "react";
import { Badge } from "@/components/ui/badge";
import { Project } from "../types";
import { ProjectThumbnailCarousel } from "./ProjectThumbnailCarousel";
import { MuxVideo } from "./MuxVideo"; // Import our new component

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  // Add this debug log to check what video data is coming in
  console.log("Mux video details:", {
    title: project.title,
    enabled: project.featuredVideoEnabled,
    playbackId: project.featuredVideo?.video?.asset?.playbackId
  });

  return (
    <div 
      className="group relative overflow-hidden rounded-lg cursor-pointer"
      onClick={() => onClick(project)}
    >
      {/* Project Image or Video */}
      <div className="h-80 md:h-110 relative overflow-hidden rounded-lg">
        {project.featuredVideoEnabled && project.featuredVideo?.video?.asset?.playbackId ? (
          <div className="absolute inset-0 overflow-hidden">
            <MuxVideo
              playbackId={project.featuredVideo.video.asset.playbackId}
              title={project.featuredVideo.title}
              className="w-full h-full"
              view="card"
              fitMode="cover"
            />
          </div>
        ) : project.featuredImage ? (
          <div className="rounded-lg overflow-hidden w-full h-full">
            <ProjectThumbnailCarousel project={project} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">No image</p>
          </div>
        )}
      </div>
  
      {/* Project Info */}
      <div className="mt-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {project.clientInfo?.clientName || ''}
        </div>
        <h3 className="text-xl font-heading font-medium mt-1">{project.title}</h3>
        
        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-2">
          {project.projectField && (
            <Badge variant="outline" className="bg-background/80">
              {project.projectField.title || project.projectField.slug?.current || 'Unknown'}
            </Badge>
          )}
          {project.projectSector && (
            <Badge variant="outline" className="bg-background/80">
              {project.projectSector.title || project.projectSector.slug?.current || 'Unknown'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};