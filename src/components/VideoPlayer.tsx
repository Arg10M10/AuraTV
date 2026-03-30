"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2, MonitorPlay, RefreshCw } from "lucide-react";
import { getVideoProxyUrl } from "@/hooks/useXtream";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingProxy, setUsingProxy] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);

  useEffect(() => {
    setCurrentUrl(url);
    setUsingProxy(false);
    setError(null);
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentUrl) return;

    setIsLoading(true);
    
    // Configuración para HLS (.ts o .m3u8)
    if (currentUrl.includes(".m3u8") || (currentUrl.includes(".ts") && !usingProxy)) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });
        hls.loadSource(currentUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal && !usingProxy) {
            console.log("[VideoPlayer] HLS falló, intentando proxy...");
            handleRetryWithProxy();
          }
        });
        return () => hls.destroy();
      }
    }

    // Carga directa para MKV/MP4
    video.src = currentUrl;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch(() => {});
    };

    const handleError = () => {
      if (!usingProxy) {
        console.log("[VideoPlayer] Error de carga inicial, intentando túnel proxy...");
        handleRetryWithProxy();
      } else {
        setError("El servidor IPTV no responde ni a través del túnel de seguridad.");
        setIsLoading(false);
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [currentUrl, usingProxy]);

  const handleRetryWithProxy = () => {
    setUsingProxy(true);
    setCurrentUrl(getVideoProxyUrl(url));
  };

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
            {usingProxy ? "Conectando vía Túnel Seguro" : "Sincronizando 4K MKV"}
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center z-20">
          <MonitorPlay className="h-16 w-16 text-destructive mb-6" />
          <h3 className="text-white text-xl font-black mb-2">ERROR DE CONEXIÓN</h3>
          <p className="text-zinc-500 text-sm max-w-sm mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Reintentar todo
          </button>
        </div>
      )}

      {usingProxy && !isLoading && !error && (
        <div className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter backdrop-blur-md">
          Modo Compatibilidad Activo
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;