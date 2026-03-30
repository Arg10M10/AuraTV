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
  const [canPlay, setCanPlay] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCanPlay(false);
    
    // Timeout de seguridad: si en 15 segundos no ha cargado, mostramos error
    const timeout = setTimeout(() => {
      if (isLoading && !canPlay && !hasError) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [url, retryKey]);

  const handleReady = () => {
    setIsLoading(false);
    setCanPlay(true);
  };

  const handleError = (e: any) => {
    console.error("🔴 Error en ReactPlayer:", e);
    setIsLoading(false);
    setHasError(true);
  };
  
  const handleRetry = () => {
    setRetryKey(prevKey => prevKey + 1);
  };

  if (!isClient) return null;

  return (
    <div className="relative w-full h-full bg-black group rounded-3xl overflow-hidden">
      {url ? (
        <ReactPlayer
          ref={playerRef}
          key={retryKey}
          url={url}
          width="100%"
          height="100%"
          playing={true} // Intentamos reproducir siempre
          controls={true}
          onReady={handleReady}
          onStart={() => {
            setIsLoading(false);
            setCanPlay(true);
          }}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          onError={handleError}
          playsinline={true}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                preload: 'auto',
                crossOrigin: "anonymous"
              },
              forceHLS: url.includes('.m3u8') || url.includes('/live/'),
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white/20">
          Esperando señal del servidor...
        </div>
      )}

      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 p-6 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <p className="text-white font-bold tracking-widest text-sm uppercase">
            Sincronizando con {serverName || "Servidor"}...
          </p>
          <p className="text-white/40 text-xs mt-2">Esto puede tardar unos segundos dependiendo de tu conexión</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-white">Error de Conexión</h3>
          <p className="text-zinc-400 text-sm max-w-md mb-8">
            No se pudo establecer la conexión con el servidor de video. El enlace puede haber expirado o el servidor está saturado.
          </p>
          <Button onClick={handleRetry} size="lg" className="bg-primary hover:bg-primary/80 text-white">
            <RefreshCw className="mr-2 h-5 w-5" /> Reintentar Conexión
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;