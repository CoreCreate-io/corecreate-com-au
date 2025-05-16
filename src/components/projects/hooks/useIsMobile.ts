// Create a reusable hook for this
import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if running in the browser
    if (typeof window === 'undefined') return;
    
    // Use a debounced resize handler with requestAnimationFrame
    let rafId: number | null = null;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        checkMobile();
        rafId = null;
      });
    };
    
    // Initial check
    checkMobile();
    
    // Add listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);
  
  return isMobile;
}