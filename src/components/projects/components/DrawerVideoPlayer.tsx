'use client'

import React, { useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';

interface VideoPlayerProps {
  playbackId: string;
  title?: string;
}

export function VideoPlayer({ playbackId, title }: VideoPlayerProps) {
  const [isBuffering, setIsBuffering] = useState(true);
  
  return (
    <div 
      className="relative w-full aspect-video bg-black"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ 
        isolation: 'isolate', 
        position: 'relative', 
        zIndex: 20 
      }}
    >
      <MuxPlayer
        playbackId={playbackId}
        metadata={{ video_title: title || '' }}
        className="w-full h-full drawer-mux-player"
        autoPlay={true}
        loop={false}
        muted={false}
        streamType="on-demand"
        thumbnailTime={0}
        preload="auto"
        accentColor="#BAFF00"
        onLoadStart={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        style={{
          height: '100%',
          width: '100%',
          objectFit: 'contain',
          pointerEvents: 'auto',
          touchAction: 'auto',
        }}
      />
    </div>
  );
}