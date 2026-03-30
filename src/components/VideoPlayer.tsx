"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MonitorPlay, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setIsLoading(true);
    setError(null);
    
    /**
     * Como estamos en Web, usamos el Túnel de Streaming de Supabase.
     * Este túnel inyecta el User-Agent 'IPTVSmarters/1.0.0' que el CDN exige.
     */
    const proxyUrl = `https://vspullgchtzqgdclqjaw.supabase.co/functions/v1/video-proxy?url=${encodeURIComponent(url)}`;
    video.src = proxyUrl;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch((e) => {
        console.warn("[VideoPlayer] Autoplay bloqueado:", e);
      });
    };

    const handleError = () => {
      console.error("[VideoPlayer] Error de carga:", video.error);
      setError("El CDN ha rechazado la conexión. Es posible que el enlace haya caducado.");
      setIsLoading(false);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl group border-4 border-white/5 focus-within:border-primary transition-all">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        crossOrigin="anonymous"
      />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white font-black tracking-widest text-[10px] uppercase animate-pulse">
            Sincronizando Túnel 4K MKV
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center z-20">
          <MonitorPlay className="h-16 w-16 text-destructive mb-6" />
          <h3 className="text-white text-xl font-black mb-2">ERROR DE CARGA CDN</h3>
          <p className="text-zinc-500 text-sm max-w-sm mb-6">
            El túnel no pudo saltar la protección del CDN o el formato MKV no es compatible con este navegador.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Reintentar
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;