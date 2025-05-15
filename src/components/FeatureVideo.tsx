"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface FeatureVideoProps {
  videoUrl?: string; // Make videoUrl optional
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
  // Return null if no video URL is provided
  if (!videoUrl) return null;
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoQuality, setVideoQuality] = useState('low');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoaded = () => setIsLoaded(true);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadeddata", handleLoaded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadeddata", handleLoaded);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover"
        poster={posterImage}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="auto"
        onLoadedMetadata={() => setIsLoaded(true)}
      >
        <source src={`${videoUrl}?quality=low`} type="video/mp4" />
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Dark Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Centered Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
        <h2 
          className="text-4xl md:text-6xl lg:text-7xl text-white text-center font-extrabold"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {title}
        </h2>
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="mt-8 flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all duration-300 focus:outline-none"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </button>
      </div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}