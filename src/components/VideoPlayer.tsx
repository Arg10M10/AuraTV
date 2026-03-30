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

  // IMPORTANTE: Al cambiar la URL, reseteamos estados pero NO desmontamos el componente
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCanPlay(false);
    
    // Si la URL cambia, forzamos un pequeño delay antes de intentar reproducir
    const timer = setTimeout(() => {
      // El estado canPlay se activará realmente en onReady
    }, 100);
    
    return () => clearTimeout(timer);
  }, [url]);

  const handleReady = () => {
    setIsLoading(false);
    setCanPlay(true);
  };

  const handleError = (e: any) => {
    console.error("🔴 Error en ReactPlayer:", e);
    setIsLoading(false);
    setHasError(true);
    setCanPlay(false);
  };
  
  const handleRetry = () => {
    setRetryKey(prevKey => prevKey + 1);
  };

  if (!isClient) {
    return (
      <div className="relative w-full h-full bg-black group rounded-3xl overflow-hidden flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black group rounded-3xl overflow-hidden">
      {url ? (
        <ReactPlayer
          ref={playerRef}
          // NOTA: Solo usamos retryKey para el remount manual, NO la url.
          // Esto evita que el elemento sea "removido del documento" al cambiar de video.
          key={retryKey}
          url={url}
          width="100%"
          height="100%"
          playing={canPlay}
          controls={true}
          onReady={handleReady}
          onStart={() => setIsLoading(false)}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          onError={handleError}
          playsinline={true}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                preload: 'auto',
                // Añadimos esto para asegurar compatibilidad con HLS y proxies
                crossOrigin: "anonymous"
              },
              forceHLS: url.includes('.m3u8') || url.includes('/live/'),
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white/20">
          Esperando señal del servidor premium...
        </div>
      )}

      {(isLoading || !canPlay) && url && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 p-6 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <p className="text-white font-bold tracking-widest text-sm uppercase">
            Sincronizando con {serverName || "Servidor"}...
          </p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-white">Error de Conexión</h3>
          <p className="text-zinc-400 text-sm max-w-md mb-8">
            No se pudo establecer la conexión con el servidor. Es posible que el enlace haya expirado o el servidor esté saturado.
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