"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    setIsLoading(true);

    // Limpiar contenedor previo
    videoRef.current.innerHTML = "";

    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered w-full h-full";
    videoElement.setAttribute("crossorigin", "anonymous");
    videoElement.setAttribute("controls", "true");
    videoElement.setAttribute("playsinline", "true");
    videoRef.current.appendChild(videoElement);

    // Proxy de navegador ligero (AllOrigins) solo para bypass de CORS
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    // Configuración exacta solicitada
    const player = playerRef.current = videojs(videoElement, {
      techOrder: ['html5'],
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{
        src: corsProxyUrl,
        type: 'video/mp4' // Forzamos mp4 para que el navegador decodifique el stream mkv
      }],
    });

    player.on("canplay", () => setIsLoading(false));
    player.on("waiting", () => setIsLoading(true));
    player.on("playing", () => setIsLoading(false));

    player.on("error", () => {
      console.error("[VideoJS] Error:", player.error());
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
    <div className="relative w-full h-full bg-black">
      <div ref={videoRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;