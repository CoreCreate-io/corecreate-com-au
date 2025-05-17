import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Project } from "../types";

interface DrawerHeaderProps {
  project: Project | null;
  isMobile: boolean;
}

export function DrawerHeader({ project, isMobile }: DrawerHeaderProps) {
  if (!project) return null;
  
  return (
    <div className={`mb-4 ${isMobile ? 'p-4' : ''}`}>
      {project.clientInfo?.clientName && (
        <p className="text-xl text-muted-foreground mt-1">
          {project.clientInfo.clientName}
        </p>
      )}
      
      <h2 className="text-3xl font-heading font-semibold">{project.title}</h2>
      
      {/* Project Categories */}
      <div className="flex flex-wrap gap-2 mt-4">
        {project.projectField && (
          <Badge variant="default">{project.projectField.title}</Badge>
        )}
        
        {project.projectSector && (
          <Badge variant="secondary">{project.projectSector.title}</Badge>
        )}
        
        {/* Add subcategories display */}
        {project.subCategories?.map(subCat => (
          <Badge key={subCat._ref} variant="outline">
            {subCat.title}
          </Badge>
        ))}
      </div>
      
      {/* Project Description */}
      {project.description && (
        <div className="mt-4">
          <p className="text-muted-foreground text-lg leading-relaxed">{project.description}</p>
        </div>
      )}
    </div>
  );
}