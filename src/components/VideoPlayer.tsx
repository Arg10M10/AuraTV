"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Maximize, Volume2, Play, Pause } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detectamos si estamos en Android nativo o en Web
  const isNative = (window as any).Capacitor?.isNativePlatform();

  useEffect(() => {
    if (!url || !videoRef.current) return;
    
    setIsBuffering(true);

    /**
     * ESTRATEGIA DE COMPATIBILIDAD:
     * - En la Web (Preview): Usamos el proxy para saltar el bloqueo de seguridad (CORS/HTTP).
     * - En Android Nativo: Usamos el link directo (es más rápido y soporta 4K).
     */
    const finalUrl = isNative 
      ? url 
      : `https://vspullgchtzqgdclqjaw.supabase.co/functions/v1/video-proxy?url=${encodeURIComponent(url)}`;

    videoRef.current.src = finalUrl;
    videoRef.current.load();
  }, [url, isNative]);

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center group overflow-hidden"
      onMouseMove={() => {
        setShowControls(true);
        setTimeout(() => setShowControls(false), 3000);
      }}
    >
      {/* CAPA DE CARGA (Diseño TV) */}
      {isBuffering && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-white font-black text-xs tracking-[0.3em] uppercase animate-pulse">
            Sincronizando 4K Directo
          </p>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={false}
        autoPlay
        playsInline
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoadStart={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onClick={(e) => {
          const v = e.currentTarget;
          v.paused ? v.play() : v.pause();
        }}
      />

      {/* CONTROLES ESTILO TV (Aparecen al mover el mouse o enfocar) */}
      <div className={`absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-500 flex items-end justify-between ${showControls || isBuffering ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] font-black uppercase">4K ULTRA HD</div>
            <span className="text-white/60 text-xs font-medium uppercase tracking-widest">LimitedCDN Stream</span>
          </div>
          <h2 className="text-white text-lg font-bold truncate max-w-md">Reproduciendo Contenido</h2>
        </div>
        <div className="flex gap-4">
           <div className="p-3 rounded-full bg-white/10 hover:bg-primary transition-colors cursor-pointer">
              <Maximize className="h-5 w-5 text-white" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;