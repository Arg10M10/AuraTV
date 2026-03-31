"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Hls from "hls.js";
import { Loader2, X, Play, Pause, RotateCcw, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  onClose: () => void;
}

const VideoPlayer = ({ url, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Si es HLS (.m3u8), usamos hls.js para mayor control
    if (url.includes(".m3u8") && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play();
        setLoading(false);
      });
      hls.on(Hls.Events.ERROR, () => setError("Error en el flujo HLS"));
    } else {
      // Para MKV y otros flujos directos de Xtream
      const player = (playerRef.current = videojs(videoRef.current, {
        autoplay: true,
        controls: false,
        sources: [{ src: url, type: url.includes(".mkv") ? "video/x-matroska" : "video/mp4" }]
      }));

      player.on("playing", () => setLoading(false));
      player.on("error", () => {
        setError("Formato no soportado por el motor web. Intenta otro título.");
        setLoading(false);
      });
    }

    return () => {
      if (playerRef.current) playerRef.current.dispose();
    };
  }, [url]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden group">
      {/* OVERLAY tvOS (Solo aparece al mover el ratón) */}
      <div className="absolute inset-0 z-[110] flex flex-col justify-between p-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-black/90 via-transparent to-black/50">
        
        {/* Cabecera Glassmorphism */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-white/5 backdrop-blur-[20px] p-6 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-black italic tracking-tighter text-white">AURA PRIVATE</h2>
            <p className="text-primary font-bold text-xs uppercase tracking-[0.5em] mt-1">4K ULTRA HD STREAM</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-[40px] p-6 rounded-full text-white transition-all hover:scale-110 border border-white/10"
          >
            <X className="h-10 w-10" />
          </button>
        </div>

        {/* Controles y Barra de Progreso */}
        <div className="space-y-12 pointer-events-auto">
          <div className="flex items-center justify-center gap-16">
             <button className="text-white/40 hover:text-white transition-all transform hover:scale-110 active:scale-90">
               <RotateCcw className="h-12 w-12" />
             </button>
             <button className="bg-white text-black p-8 rounded-full hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)]">
               <Pause className="h-14 w-14 fill-black" />
             </button>
             <div className="text-white/40 hover:text-white transition-all transform rotate-180 hover:scale-110 active:scale-90">
               <RotateCcw className="h-12 w-12" />
             </div>
          </div>
          
          {/* Barra Apple TV */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
            <div className="h-full bg-white w-1/3 shadow-[0_0_15px_rgba(255,255,255,1)]" />
          </div>
        </div>
      </div>

      <video ref={videoRef} className="w-full h-full object-contain" />

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[120]">
          <Loader2 className="h-20 w-20 animate-spin text-primary" />
          <p className="mt-8 text-white font-black tracking-[0.4em] uppercase text-sm animate-pulse">Sincronizando con Aura TV</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-[130] p-8 text-center">
          <AlertCircle className="h-20 w-20 text-destructive mb-6" />
          <h3 className="text-3xl font-black uppercase mb-4">{error}</h3>
          <button 
            onClick={onClose}
            className="bg-primary text-primary-foreground px-12 py-4 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Cerrar Reproductor
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;