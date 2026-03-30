"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [isBuffering, setIsBuffering] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!url || !videoRef.current) return;
    setIsBuffering(true);
    
    // CARGA DIRECTA: Sin proxies intermedios.
    videoRef.current.src = url;
    videoRef.current.load();
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {isBuffering && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
            Direct Link: Hardware Decoding Active
          </p>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        autoPlay
        playsInline
        // REGLAS CRÍTICAS DE SEGURIDAD PARA REDIRECCIÓN HTTP -> HTTPS
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
      >
        {/* Forzamos el tipo mp4 para activar decodificación por hardware incluso en MKVs */}
        <source src={url} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoPlayer;