"use client";

import { useState, useRef, useEffect } from "react";
import { Container } from "@/components/layout/container";

interface FeatureVideoProps {
  videoUrl?: string;
  title: string;
  posterImage?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export default function FeatureVideo({
  videoUrl,
  title,
  posterImage,
  autoPlay = true,
  muted = true,
  loop = true,
}: FeatureVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Early return inside the effect is fine
    if (!videoUrl) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    // Reset loading state on each mount/refresh
    setIsLoaded(false);
    
    // Multiple events to handle different browser behaviors
    const events = ["loadeddata", "canplay", "playing", "loadedmetadata"];
    
    const handleLoaded = () => {
      setIsLoaded(true);
    };
    
    // Add all event listeners
    events.forEach(event => {
      video.addEventListener(event, handleLoaded);
    });
    
    // Fallback timeout - if video hasn't loaded in 5 seconds, show it anyway
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 5000);
    
    // Handle case where video is already cached and ready
    if (video.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
      setIsLoaded(true);
    }
    
    return () => {
      // Clean up all event listeners
      events.forEach(event => {
        video.removeEventListener(event, handleLoaded);
      });
      clearTimeout(fallbackTimer);
    };
  }, [videoUrl]); // Depend on videoUrl to reset on URL changes
  
  // Return null AFTER hooks are declared
  if (!videoUrl) return null;
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover"
        poster={posterImage}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="auto"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Rest of component remains the same */}
    </div>
  );
}