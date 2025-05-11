"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Container({ children, className = "", fullWidth = false }: ContainerProps) {
  const pathname = usePathname();
  const isStudioPath = pathname?.startsWith('/studio');
  
  // Don't apply constraints for studio or if fullWidth is explicitly set
  if (isStudioPath || fullWidth) {
    return <div className={className}>{children}</div>;
  }
  
  // Apply max-width constraints for regular content
  return (
    <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}