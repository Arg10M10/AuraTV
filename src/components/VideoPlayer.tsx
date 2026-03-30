"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    setIsLoading(true);
    setError(null);

    // Limpieza total del DOM
    videoRef.current.innerHTML = "";

    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered w-full h-full";
    
    // ATRIBUTOS CRÍTICOS SOLICITADOS
    videoElement.setAttribute("crossorigin", "anonymous");
    videoElement.setAttribute("controls", "true");
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("webkit-playsinline", "true");
    videoElement.setAttribute("preload", "auto");
    
    videoRef.current.appendChild(videoElement);

    // BYPASS DE CORS (AllOrigins)
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    // CONFIGURACIÓN TÉCNICA OBLIGATORIA
    const options = {
      techOrder: ['html5'],
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      // Headers de Smart TV / Override Nativo
      html5: {
        vhs: { overrideNative: true },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      },
      sources: [{
        src: corsProxyUrl,
        type: 'video/mp4' // TRUCO DE MIME TYPE PARA HARDWARE
      }],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'fullscreenToggle',
        ],
      },
    };

    const player = playerRef.current = videojs(videoElement, options);

    // Listeners de estado
    player.on("playing", () => setIsLoading(false));
    player.on("waiting", () => setIsLoading(true));
    player.on("canplay", () => setIsLoading(false));

    player.on("error", () => {
      const vjsError = player.error();
      console.error("[4K-DECODER] Fallo:", vjsError);
      setError(`Error de decodificación: ${vjsError?.message || 'Formato no soportado por el hardware'}`);
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
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden group">
      <div ref={videoRef} className="w-full h-full" />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
          <Loader2 className="h-14 w-14 animate-spin text-primary mb-4" />
          <div className="text-center space-y-1">
            <p className="text-white font-bold tracking-tighter uppercase text-sm">Sincronizando Stream 4K</p>
            <p className="text-white/30 text-[10px] font-mono">BYPASS: ALLORIGINS | DECO: HW-ACCEL</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center z-20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-white font-bold mb-2">Fallo de Reproducción</h3>
          <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
          <p className="mt-4 text-[10px] text-zinc-700 uppercase">Nota: Los archivos MKV 4K requieren hardware compatible con HEVC.</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;