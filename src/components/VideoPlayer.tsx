"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  serverName?: string;
}

const VideoPlayer = ({ url, serverName }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    setIsLoading(true);
    setError(null);

    // Limpiar contenedor previo
    if (videoRef.current) {
      videoRef.current.innerHTML = "";
    }

    // Crear elemento de video con atributos de seguridad solicitados
    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered vjs-theme-city w-full h-full";
    videoElement.setAttribute("crossorigin", "anonymous");
    videoElement.setAttribute("referrerpolicy", "no-referrer");
    videoElement.setAttribute("playsinline", "true");
    videoRef.current.appendChild(videoElement);

    // Proxy ligero AllOrigins para saltar CORS sin procesar el video
    const finalUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    // Determinamos el tipo MIME. Forzamos video/mp4 para MKV/VOD para engañar al navegador
    const isLive = url.includes(".m3u8");
    const type = isLive ? "application/x-mpegURL" : "video/mp4";

    const player = playerRef.current = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      sources: [{
        src: finalUrl,
        type: type
      }],
      controlBar: {
        children: [
          "playToggle",
          "volumePanel",
          "currentTimeDisplay",
          "timeDivider",
          "durationDisplay",
          "progressControl",
          "liveDisplay",
          "fullscreenToggle",
        ],
      },
    });

    player.on("ready", () => {
      setIsLoading(false);
    });

    player.on("waiting", () => setIsLoading(true));
    player.on("playing", () => setIsLoading(false));

    player.on("error", () => {
      const err = player.error();
      console.error("[VideoJS] Error:", err);
      setError(`Error de reproducción: ${err?.message || "Formato no soportado"}`);
      setIsLoading(false);
    });

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden group">
      <div ref={videoRef} className="w-full h-full" />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 pointer-events-none">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white/60 text-sm font-medium">Conectando con {serverName || "Servidor Directo"}...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Señal Interrumpida</h3>
          <p className="text-zinc-500 text-sm max-w-md mb-6">{error}</p>
          <div className="text-xs text-zinc-600 bg-black/40 p-3 rounded-lg font-mono break-all">
            URL: {url.substring(0, 60)}...
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;