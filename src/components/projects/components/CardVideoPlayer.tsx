'use client'

import React from 'react';
import MuxPlayer from '@mux/mux-player-react';

interface CardVideoPlayerProps {
  playbackId: string;
  title?: string;
}

// Add this type definition for custom CSS properties
interface CustomCSSProperties extends React.CSSProperties {
  [key: `--${string}`]: string | number;
}

export function CardVideoPlayer({ playbackId, title }: CardVideoPlayerProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <MuxPlayer
        playbackId={playbackId}
        metadata={{ video_title: title || '' }}
        streamType="on-demand"
        className="w-full h-full card-mux-player"
        autoPlay={true}
        loop={true}
        muted={true}
        thumbnailTime={0}
        preload="auto"
        style={{
          height: '100%',
          width: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          zIndex: 10,
          // CSS custom properties defined separately
          '--controls': 'none',
          '--media-object-fit': 'cover',
        } as CustomCSSProperties}
      />
    </div>
  );
}