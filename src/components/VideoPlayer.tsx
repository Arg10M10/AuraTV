"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2, Smartphone, MonitorPlay } from "lucide-react";

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

    // Si es un stream HLS (.m3u8 o .ts adaptativo)
    if (url.includes(".m3u8") || url.includes(".ts")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(console.warn);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError(`Fallo HLS: ${data.type}`);
            setIsLoading(false);
          }
        });
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Soporte nativo de Safari/Android Webview para HLS
        video.src = url;
      }
    } else {
      // Para .mkv, .mp4 o streams directos (Aprovecha Hardware Accel)
      video.src = url;
    }

    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch(console.warn);
    };

    const handleError = () => {
      setError("Error de decodificación. Verifica los permisos de red (Cleartext).");
      setIsLoading(false);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.pause();
      video.src = "";
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl group border-4 border-white/5 focus-within:border-primary transition-all">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        preload="auto"
      />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-white font-black tracking-widest text-xs uppercase animate-pulse">Sincronizando 4K</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center z-20">
          <MonitorPlay className="h-16 w-16 text-destructive mb-6" />
          <h3 className="text-white text-xl font-black mb-2">STREAM BLOQUEADO</h3>
          <p className="text-zinc-500 text-sm max-w-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;