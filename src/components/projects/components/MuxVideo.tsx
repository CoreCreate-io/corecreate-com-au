'use client'

import MuxPlayer from '@mux/mux-player-react'
import { useState } from 'react'

interface MuxVideoProps {
  playbackId: string;
  title?: string;
  className?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  fitMode?: 'cover' | 'contain' | 'height';
  controlsStyle?: 'minimal' | 'standard' | 'none';
  view?: 'card' | 'drawer';
  priority?: boolean;
}

export function MuxVideo({
  playbackId,
  title,
  className = '',
  controls = false,
  autoplay = true,
  loop = true,
  muted = true,
  fitMode = 'cover',
  controlsStyle = 'standard',
  view = 'card',
  priority = false
}: MuxVideoProps) {
  const [isBuffering, setIsBuffering] = useState(true);
  
  if (!playbackId) return null;

  // Determine object-fit mode
  let objectFit = 'cover';
  let objectPosition = 'center';
  
  if (fitMode === 'height') {
    objectFit = 'contain';
    objectPosition = 'center center';
  } else if (fitMode === 'contain') {
    objectFit = 'contain';
  }

  // For cards, force specific behaviors
  if (view === 'card') {
    controls = false;
    autoplay = true;
    loop = true;
    muted = true;
  }

  // Controls configuration
  const controlsConfig = !controls ? 'none' : 
                        (view === 'drawer' && controlsStyle === 'minimal') ? 
                          'play,progress,mute,volume,fullscreen' : 
                        controlsStyle === 'minimal' ? 
                          'play-large,play,progress,mute,volume,fullscreen' : 
                          'default';

  return (
    <>
      {isBuffering && view !== 'card' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
          <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <MuxPlayer
        streamType="on-demand"
        playbackId={playbackId}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        // Removed controls prop - it's not accepted by MuxPlayer
        thumbnailTime={0}
        preload="auto"
        className={`${className} ${view === 'card' ? 'mux-card' : 'mux-drawer'}`}
        onLoadStart={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        style={{
          height: '100%',
          width: view === 'card' ? '100%' : 'auto',
          minWidth: '100%', 
          objectFit: objectFit,
          // This is the correct way to control the controls display
          '--controls': controls ? controlsConfig : 'none',
          '--media-object-fit': objectFit,
          '--media-object-position': objectPosition,
          '--poster-object-fit': objectFit,
          '--title-display': 'none',
          '--time-display': view === 'card' ? 'none' : 'block',
          '--seek-backward-button-display': 'none',
          '--seek-forward-button-display': 'none',
          '--control-bar-vertical-padding': '8px',
          '--control-bar-height': view === 'drawer' ? '50px' : '40px',
          '--bottom-play-button-position': 'absolute',
          '--bottom-play-button-right': 'auto',
          '--bottom-play-button-left': '8px',
          '--bottom-play-button-bottom': '8px',
          '--stalled-retry-timeout': '0',
          '--stalled-retry-count': '3',
          opacity: isBuffering && view !== 'card' ? '0.7' : '1',
        } as React.CSSProperties}
        metadata={{ video_title: title }}
      />
    </>
  );
}