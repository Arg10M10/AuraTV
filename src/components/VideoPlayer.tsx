"use client";

import ReactPlayer from "react-player";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full bg-black group rounded-3xl overflow-hidden">
      {url ? (
        <ReactPlayer
          url={url}
          controls
          playing
          width="100%"
          height="100%"
          onReady={() => setIsLoading(false)}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          onError={(e) => {
            console.error("Error en reproductor:", e);
            setIsLoading(false);
            setHasError(true);
          }}
          config={{
            file: {
              forceVideo: true,
              attributes: {
                crossOrigin: "anonymous",
              },
              // Configuración para evitar bloqueos de servidores IPTV
              hlsOptions: {
                xhrSetup: function(xhr: any) {
                  xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                }
              }
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white/20">
          Esperando señal...
        </div>
      )}

      {isLoading && url && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-white font-bold tracking-widest text-sm uppercase">Conectando al Servidor...</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold mb-2">Error de Reproducción</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            El servidor bloqueó la conexión o el formato no es compatible. Intenta usar el servidor de respaldo.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;