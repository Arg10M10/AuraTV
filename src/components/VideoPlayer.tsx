"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Smartphone } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  serverName?: string;
}

const VideoPlayer = ({ url, serverName }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    
    // Reset del motor de video nativo
    video.pause();
    video.src = url;
    video.load();

    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch(e => console.warn("Autoplay bloqueado:", e));
    };

    const handleError = () => {
      console.error("[NATIVE-VIDEO] Error en stream:", video.error);
      setError(`Fallo de decodificación (Code: ${video.error?.code || 'Unknown'})`);
      setIsLoading(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.pause();
      video.src = "";
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        webkit-playsinline="true"
        preload="auto"
      />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 backdrop-blur-xl">
          <Loader2 className="h-14 w-14 animate-spin text-primary mb-4" />
          <div className="text-center space-y-1">
            <p className="text-white font-bold tracking-tighter uppercase text-sm">Sincronizando Stream 4K</p>
            <p className="text-white/30 text-[10px] font-mono">ENGINE: CAPACITOR-NATIVE | DECO: HW-ACCEL</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center z-20">
          <Smartphone className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-white font-bold mb-2">Error de Video</h3>
          <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
          <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] text-zinc-400 text-left">
            <p className="font-bold text-white mb-1 uppercase">Importante:</p>
            Asegúrate de que el APK tenga <code className="text-primary">usesCleartextTraffic="true"</code> en el manifiesto para permitir streams HTTP.
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;