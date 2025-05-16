"use client";

import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/layout/container";
import MuxPlayer from '@mux/mux-player-react';
import Image from 'next/image';

// Import the correct type from MuxPlayer React
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

interface FeatureVideoProps {
  playbackId?: string;
  title: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export default function FeatureVideo({
  playbackId,
  title,
  autoPlay = true,
  muted = true,
  loop = true,
}: FeatureVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // Use the correct ref type from MuxPlayer
  const playerRef = useRef<MuxPlayerRefAttributes>(null);

  
  // Handle errors or missing playback ID
  useEffect(() => {
    if (!playbackId) return;
    
    const timer = setTimeout(() => {
      if (!isLoaded) {
        console.log('Video taking too long to load, showing content anyway');
        setIsLoaded(true);
        setIsBuffering(false);
      }
    }, 5000); // 5 second fallback
    
    return () => clearTimeout(timer);
  }, [isLoaded, playbackId]);

  // Add resize observer to ensure proper sizing after window resize
  useEffect(() => {
    if (!playerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // Force update to ensure video covers container
      if (playerRef.current && playerRef.current.style) {
        playerRef.current.style.width = '100%';
        playerRef.current.style.height = '100%';
      }
    });
    
    resizeObserver.observe(playerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []); // No dependencies needed here
  
  // Return null if no video
  if (!playbackId) return null;
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Thumbnail placeholder instead of loading spinner */}
      {(isBuffering || !isLoaded) && (
        <div className="absolute inset-0 w-full h-full z-10">
          
          {/* Small loading indicator on top of thumbnail */}
          <div className="absolute bottom-4 right-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          </div>
        </div>
      )}
      
      {/* Video */}
      <div className="absolute inset-0 w-full h-full">
        <MuxPlayer
          ref={playerRef}
          streamType="on-demand"
          playbackId={playbackId}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          preload="auto"
          startTime={0}
          className="w-full h-full"
          onLoadStart={() => setIsBuffering(true)}
          onCanPlay={() => {
            setIsLoaded(true);
            setIsBuffering(false);
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onError={(e) => {
            console.error('Mux video error:', e);
            setIsError(true);
            setIsLoaded(true);
            setIsBuffering(false);
          }}
          style={{
            height: '100%',
            width: '100%',
            '--controls': 'none',
            '--media-object-fit': 'cover',
            '--media-object-position': 'center center',
            '--poster-object-fit': 'cover',
            '--stalled-retry-timeout': '0',
            '--stalled-retry-count': '3',
            position: 'absolute',
            inset: 0,
          } as React.CSSProperties}
          metadata={{ video_title: title }}
          envKey={process.env.NEXT_PUBLIC_MUX_ENV_KEY}
        />
      </div>

      {/* Dark Overlay - make slightly lighter */}
      <div className="absolute inset-0 bg-black opacity-30 z-5"></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <Container>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white text-center font-extrabold font-sora">
            {title}
          </h2>
        </Container>
      </div>
    </div>
  );
}