"use client";

import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  url: string;
  serverName?: string;
}

const VideoPlayer = ({ url, serverName }: VideoPlayerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [url, retryKey]);

  const handleReady = () => {
    setIsLoading(false);
  };

  const handleError = (e: any) => {
    console.error("🔴 Error en VideoPlayer:", e);
    setIsLoading(false);
    setHasError(true);
  };

  if (!isClient) return null;

  // Solo forzamos HLS para canales en vivo (.m3u8)
  // Para películas (.mkv, .mp4, .ts), dejamos que el navegador decida
  const isLive = url.includes('.m3u8') || url.includes('/live/');

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl">
      {url ? (
        <ReactPlayer
          ref={playerRef}
          key={`${url}-${retryKey}`}
          url={url}
          width="100%"
          height="100%"
          playing={true}
          controls={true}
          onReady={handleReady}
          onStart={() => setIsLoading(false)}
          onError={handleError}
          playsinline={true}
          config={{
            file: {
              forceHLS: isLive,
              attributes: {
                crossOrigin: "anonymous",
                style: { objectFit: 'contain' }
              },
              hlsOptions: {
                enableWorker: true,
                lowLatencyMode: true,
              }
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white/20 italic">
          Esperando señal...
        </div>
      )}

      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white/60 text-sm animate-pulse">Conectando con {serverName || "Servidor Premium"}...</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Error de Reproducción</h3>
          <p className="text-zinc-500 text-xs mb-6 max-w-xs">
            El formato de video ({url.split('.').pop()?.split('?')[0]}) puede no ser compatible con tu navegador web.
          </p>
          <Button onClick={() => setRetryKey(k => k + 1)} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;