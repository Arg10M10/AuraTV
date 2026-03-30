"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Hls from "hls.js";
import "video.js/dist/video-js.css";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    setIsLoading(true);
    setError(null);

    // 1. Limpieza de instancias previas
    if (playerRef.current) {
      playerRef.current.dispose();
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
    videoRef.current.innerHTML = "";

    // 2. Preparar URL (Forzar HLS .m3u8 para activar transcodificación/segmentación)
    const hlsUrl = url.replace(/\.(mkv|mp4|avi|mov)$/i, '.m3u8');
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(hlsUrl)}`;

    // 3. Crear elemento de video con atributos de hardware
    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered w-full h-full";
    videoElement.setAttribute("crossorigin", "anonymous");
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("webkit-playsinline", "true");
    videoElement.setAttribute("preload", "auto");
    videoRef.current.appendChild(videoElement);

    // 4. Configuración de HLS.js (Motor de renderizado solicitado)
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,        // Uso de hilos para no bloquear la UI
        lowLatencyMode: false,     // Priorizar estabilidad en 4K sobre latencia
        backBufferLength: 90,      // Buffer extendido para evitar saltos
        maxBufferLength: 60,
        startLevel: -1,            // Auto-calidad inicial
      });

      hls.loadSource(proxyUrl);
      hls.attachMedia(videoElement);
      hlsRef.current = hls;

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("[HLS.js] Error Fatal:", data);
          setError(`Error de red/decodificación: ${data.type}`);
        }
      });
    } 
    // Soporte nativo (iOS Safari)
    else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = proxyUrl;
    }

    // 5. Inicializar Video.js para la UI y control
    const player = playerRef.current = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      html5: {
        vhs: { overrideNative: !Hls.isSupported() }
      },
      sources: [{
        src: proxyUrl,
        type: 'application/x-mpegURL' // MIME Type solicitado para HLS
      }]
    });

    player.on("playing", () => setIsLoading(false));
    player.on("waiting", () => setIsLoading(true));
    player.on("error", () => {
      const vjsError = player.error();
      setError(`VJS Error: ${vjsError?.message}`);
      setIsLoading(false);
    });

    return () => {
      if (playerRef.current) playerRef.current.dispose();
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl">
      <div ref={videoRef} className="w-full h-full" />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
          <Loader2 className="h-14 w-14 animate-spin text-primary mb-4" />
          <div className="text-center">
            <p className="text-white font-bold tracking-tighter uppercase text-sm">Decodificando 4K HEVC</p>
            <p className="text-white/30 text-[10px] font-mono">ENGINE: HLS.JS + WORKERS | BUFFER: 90s</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center z-20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-white font-bold mb-2">Fallo de Segmentación</h3>
          <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
          <div className="mt-4 p-2 bg-white/5 rounded border border-white/10 text-[9px] text-zinc-400 text-left">
            TIP: Si el servidor no soporta la extensión .m3u8 para archivos estáticos, la reproducción fallará por 404.
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;