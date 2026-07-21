import React, { useEffect, useRef, useState } from 'react';
import flvjs from 'flv.js';
import { VideoOff, Move, Maximize, Minimize } from 'lucide-react';

export default function VideoPlayer({ streamUrl, title }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  
  // States for Video Controls
  const [isCover, setIsCover] = useState(false);
  const [panEnabled, setPanEnabled] = useState(false);
  const [objPos, setObjPos] = useState({ x: 50, y: 50 });
  
  // Dragging Refs
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (flvjs.isSupported() && videoRef.current) {
      const player = flvjs.createPlayer({
        type: 'flv',
        url: streamUrl,
        isLive: true,
        cors: true
      });
      player.attachMediaElement(videoRef.current);
      player.load();
      player.play().catch(e => console.log("Autoplay blocked by browser policy"));
      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [streamUrl]);

  // --- Panning Logic ---
  const handlePointerDown = (e) => {
    if (!panEnabled || !isCover) return;
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    if (videoRef.current) videoRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    // Move object position (inverted factor for natural drag feel)
    const factor = 0.15;
    setObjPos(prev => ({
      x: Math.max(0, Math.min(100, prev.x - dx * factor)),
      y: Math.max(0, Math.min(100, prev.y - dy * factor))
    }));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (videoRef.current) videoRef.current.style.cursor = panEnabled && isCover ? 'grab' : 'default';
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden group border border-panelBorder shadow-inner">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-0">
        <VideoOff size={32} className="mb-2 opacity-50" />
        <span className="text-sm font-medium">Caméra hors ligne</span>
      </div>
      
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full z-10 transition-[object-fit] duration-300"
        style={{ 
          objectFit: isCover ? 'cover' : 'contain',
          objectPosition: `${objPos.x}% ${objPos.y}%`,
          cursor: panEnabled && isCover ? 'grab' : 'default'
        }}
        muted
        autoPlay
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      
      {/* Top Left: Title */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-gray-200 text-xs px-3 py-1.5 rounded-md z-20 font-medium flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
        {title}
      </div>

      {/* Top Right: Advanced Controls (Visible on hover) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        
        {/* Toggle Cover / Contain */}
        <button 
          onClick={() => {
            setIsCover(!isCover);
            setObjPos({ x: 50, y: 50 }); // Reset exactly to the center
            if (!isCover) setPanEnabled(false); // Disable pan if switching to contain
          }}
          className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-md transition-colors border border-white/10"
          title={isCover ? "Afficher tout (Bords noirs)" : "Remplir l'écran (Rogner)"}
        >
          {isCover ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
        
        {/* Toggle Drag Mode (Only when Cover is active) */}
        {isCover && (
          <button 
            onClick={() => setPanEnabled(!panEnabled)}
            className={`${panEnabled ? 'bg-primary' : 'bg-black/60 hover:bg-black/80'} backdrop-blur-md text-white p-2 rounded-md transition-colors border border-white/10`}
            title="Mode Déplacement (Drag)"
          >
            <Move size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
