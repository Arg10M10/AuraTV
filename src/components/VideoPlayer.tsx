"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  url: string;
  serverName?: string;
}

const VideoPlayer = ({ url, serverName }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    setIsLoading(true);
    setError(null);

    // Limpiar contenedor previo
    if (videoRef.current) {
      videoRef.current.innerHTML = "";
    }

    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered vjs-theme-city w-full h-full";
    videoElement.setAttribute("playsinline", "true");
    videoRef.current.appendChild(videoElement);

    // Usamos el proxy de video de Supabase para evitar CORS y problemas de red
    // Nota: El proxy ya maneja las cabeceras Range necesarias para VOD
    const proxyUrl = `https://vspullgchtzqgdclqjaw.supabase.co/functions/v1/video-proxy?url=${encodeURIComponent(url)}`;

    // Determinamos el tipo MIME
    const isLive = url.includes(".m3u8") || url.includes("/live/");
    const type = isLive ? "application/x-mpegURL" : "video/mp4";

    const player = playerRef.current = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      html5: {
        vhs: {
          overrideNative: !videojs.browser.IS_SAFARI,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false
      },
      sources: [{
        src: proxyUrl,
        type: type
      }],
    });

    player.on("ready", () => {
      console.log("[VideoPlayer] Reproductor listo");
      setIsLoading(false);
    });

    player.on("waiting", () => setIsLoading(true));
    player.on("playing", () => setIsLoading(false));

    player.on("error", () => {
      const err = player.error();
      console.error("[VideoJS] Error detectado:", err);
      
      let message = "El formato de video no es compatible con tu navegador o el servidor rechazó la conexión.";
      if (err?.code === 4) message = "Error de red o formato no soportado (MKV/AVI pueden fallar en algunos navegadores).";
      
      setError(message);
      setIsLoading(false);
    });

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [url, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden group">
      <div ref={videoRef} className="w-full h-full" />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 pointer-events-none">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white/60 text-sm font-medium">Iniciando túnel de video...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error de Reproducción</h3>
          <p className="text-zinc-500 text-sm max-w-md mb-6">{error}</p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reintentar Conexión
            </Button>
            
            <div className="text-[10px] text-zinc-600 bg-black/40 p-2 rounded font-mono break-all text-left">
              Source: {url.split('/').pop()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;