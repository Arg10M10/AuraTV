"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  url: string;
  serverName?: string;
}

const VideoPlayer = ({ url, serverName }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [url]);

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = (e: any) => {
    console.error("🔴 Error en reproductor:", e);
    setIsLoading(false);
    setHasError(true);
  };
  
  const handleRetry = () => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsLoading(true);
      setHasError(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-black group rounded-3xl overflow-hidden">
      {url ? (
        <video
          ref={videoRef}
          key={url}
          width="100%"
          height="100%"
          controls
          autoPlay
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onCanPlay={handleCanPlay}
          onError={handleError}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          className="w-full h-full object-contain"
        >
          <source src={url} />
          Tu navegador no soporta el video.
        </video>
      ) : (
        <div className="flex items-center justify-center h-full text-white/20">
          Esperando señal del servidor premium...
        </div>
      )}

      {isLoading && url && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 p-6 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <p className="text-white font-bold tracking-widest text-sm uppercase">
            Conectando a {serverName || "Servidor"}...
          </p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-white">Error de Reproducción</h3>
          <p className="text-zinc-400 text-sm max-w-md mb-8">
            El servidor no responde o el formato no es compatible. Intenta recargar.
          </p>
          <Button onClick={handleRetry} size="lg" className="bg-primary hover:bg-primary/80 text-white">
            <RefreshCw className="mr-2 h-5 w-5" /> Reintentar
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;