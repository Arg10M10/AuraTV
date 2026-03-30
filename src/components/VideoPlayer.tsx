"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2, MonitorPlay } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generamos la URL a través del proxy de Supabase para saltar bloqueos
  const proxiedUrl = url 
    ? `https://vspullgchtzqgdclqjaw.supabase.co/functions/v1/video-proxy?url=${encodeURIComponent(url)}`
    : "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !proxiedUrl) return;

    setIsLoading(true);
    setError(null);

    // Lógica para Streams HLS (.m3u8 o .ts)
    if (url.includes(".m3u8") || url.includes(".ts")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });
        hls.loadSource(proxiedUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setError("Error de conexión con el canal");
        });
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = proxiedUrl;
      }
    } else {
      // Para Películas (MKV, MP4, etc.) usamos el motor nativo de Android
      video.src = proxiedUrl;
    }

    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch(() => {});
    };

    const handleError = (e: any) => {
      console.error("Video Error:", video.error);
      setError("No se pudo decodificar el video. Intenta con otro título.");
      setIsLoading(false);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [proxiedUrl, url]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl group border-4 border-white/5">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        crossOrigin="anonymous"
      />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white text-xs font-bold uppercase tracking-widest animate-pulse">Iniciando Túnel Seguro...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center z-20">
          <MonitorPlay className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-white text-lg font-bold mb-2">STREAM NO DISPONIBLE</h3>
          <p className="text-zinc-500 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;