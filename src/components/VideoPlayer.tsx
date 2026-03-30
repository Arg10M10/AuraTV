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

    // Limpieza absoluta del contenedor para evitar fugas de memoria o estados previos
    videoRef.current.innerHTML = "";

    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered w-full h-full";
    // Atributos Críticos de Etiqueta
    videoElement.setAttribute("crossorigin", "anonymous");
    videoElement.setAttribute("controls", "true");
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("webkit-playsinline", "true");
    videoRef.current.appendChild(videoElement);

    // Bypass de CORS Ligero (No procesa video, solo cabeceras)
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    // Configuración Técnica Obligatoria para Smart TV y Navegadores
    const playerOptions = {
      techOrder: ['html5'],
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      // Configuración de decodificación nativa
      html5: {
        vhs: { 
          overrideNative: true 
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      },
      sources: [{
        src: corsProxyUrl,
        type: 'video/mp4' // Engaño de formato para forzar decodificador de hardware
      }],
    };

    const player = playerRef.current = videojs(videoElement, playerOptions);

    // Gestión de estados de carga
    player.on("canplay", () => setIsLoading(false));
    player.on("waiting", () => setIsLoading(true));
    player.on("playing", () => setIsLoading(false));

    player.on("error", () => {
      const error = player.error();
      console.error("[VideoJS] Fallo crítico de reproducción:", error);
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
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl">
      <div ref={videoRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 pointer-events-none">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
          <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Estabilizando Stream 4K</span>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;