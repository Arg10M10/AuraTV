"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MonitorPlay, RefreshCw } from "lucide-react";

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
     * NOTA: Los navegadores bloquean la modificación manual del User-Agent vía JS.
     * La inyección del User-Agent 'IPTVSmarters/1.0.0' debe hacerse en el 
     * código nativo de Android (MainActivity.java) que se detalla en el archivo de instrucciones.
     */
    video.src = url;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch((e) => {
        console.warn("[VideoPlayer] Autoplay bloqueado:", e);
      });
    };

    const handleError = () => {
      console.error("[VideoPlayer] Error de conexión:", video.error);
      setError("El servidor CDN ha rechazado la conexión o el formato no es compatible.");
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
        // Forzamos anonimato total para el CDN
        crossOrigin="anonymous"
        // Evitamos que el CDN sepa que venimos de una web
        referrerPolicy="no-referrer"
      />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white font-black tracking-widest text-[10px] uppercase animate-pulse">
            Iniciando Flujo MKV 4K
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center z-20">
          <MonitorPlay className="h-16 w-16 text-destructive mb-6" />
          <h3 className="text-white text-xl font-black mb-2">ERROR DE REPRODUCCIÓN</h3>
          <p className="text-zinc-500 text-sm max-w-sm mb-6">
            El CDN ha rechazado la petición. Asegúrate de haber aplicado el parche de User-Agent en Android Studio.
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