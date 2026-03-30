"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MonitorPlay, RefreshCw, Info } from "lucide-react";

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
     * Túnel de Supabase que resuelve la redirección de http -> https
     * e inyecta los headers requeridos por limitedcdn.com
     */
    const proxyUrl = `https://vspullgchtzqgdclqjaw.supabase.co/functions/v1/video-proxy?url=${encodeURIComponent(url)}`;
    video.src = proxyUrl;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch(e => console.warn("Autoplay bloqueado", e));
    };

    const handleError = () => {
      console.error("Error en Video:", video.error);
      setError("El CDN ha rechazado la conexión o el formato MKV no es compatible con este navegador.");
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white font-black tracking-widest text-xs uppercase animate-pulse">
            Resolviendo Redirección a LimitedCDN...
          </p>
          <p className="text-zinc-500 text-[10px] mt-2 max-w-xs">
            Estamos conectando el túnel seguro para saltar la protección del servidor 4K.
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center z-20">
          <MonitorPlay className="h-16 w-16 text-destructive mb-6" />
          <h3 className="text-white text-xl font-black mb-2">BLOQUEO DE CONTENIDO</h3>
          <p className="text-zinc-500 text-sm max-w-sm mb-6">
            El CDN final bloqueó la petición o tu navegador no soporta el contenedor MKV nativamente.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;