import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Project } from '../types';

export function useProjectNavigation(initialProjectSlug?: string, projects?: Project[]) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDirectAccess, setIsDirectAccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [originalPath, setOriginalPath] = useState<string>('');

  // Check if user came directly to a project URL
  useEffect(() => {
    if (initialProjectSlug && !isClosing && projects) {
      setIsDirectAccess(true);
      const projectFromUrl = projects.find(p => p.slug?.current === initialProjectSlug);
      if (projectFromUrl && !selectedProject) {
        setSelectedProject(projectFromUrl);
      }
    }
  }, [initialProjectSlug, projects, selectedProject, isClosing]);

  // Handle URL-based project selection - for direct links
  useEffect(() => {
    if (!isClosing && projects) {
      const pathSegments = pathname.split('/');
      if (pathSegments.length >= 3 && pathSegments[1] === 'projects') {
        const projectSlug = pathSegments[2];
        const projectFromUrl = projects.find(p => p.slug?.current === projectSlug);
        if (projectFromUrl && !selectedProject) {
          setSelectedProject(projectFromUrl);
          setIsDirectAccess(true);
        }
      }
    }
  }, [pathname, projects, selectedProject, isClosing]);

  // Capture original path when a project is selected
  useEffect(() => {
    if (selectedProject && !originalPath) {
      setOriginalPath(pathname);
    }
  }, [selectedProject, pathname, originalPath]);

  // Select project and update URL
  const selectProject = (project: Project) => {
    setSelectedProject(project);
    if (project.slug?.current) {
      const newUrl = `/projects/${project.slug.current}`;
      window.history.replaceState(
        { ...window.history.state, as: newUrl, url: newUrl }, 
        '', 
        newUrl
      );
    }
  };

  // Close project with appropriate navigation
  const closeProject = () => {
    setIsClosing(true);
    setSelectedProject(null);
    
    if (isDirectAccess) {
      setTimeout(() => {
        router.push('/projects');
        setTimeout(() => {
          setIsDirectAccess(false);
          setIsClosing(false);
          setOriginalPath('');
        }, 500);
      }, 600);
    } else {
      const returnPath = originalPath.includes('/projects') ? '/projects' : '/';
      window.history.replaceState(
        { ...window.history.state, as: returnPath, url: returnPath }, 
        '', 
        returnPath
      );
      setTimeout(() => {
        setIsClosing(false);
        setOriginalPath('');
      }, 600);
    }
  };

  return {
    selectedProject,
    isDirectAccess,
    isClosing,
    selectProject,
    closeProject
  };
}