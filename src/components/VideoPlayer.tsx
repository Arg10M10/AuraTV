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
    <div className="relative w-full h-full bg-black group">
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
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          config={{
            file: {
              attributes: {
                // Cabecera sugerida para IPTV Smarters compatibility
                'headers': {
                  'User-Agent': 'IPTVSmarters/1.0'
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

      {isLoading && url && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
          <Loader2 className="h-16 w-16 animate-spin text-white/80 mb-4" />
          <p className="text-white font-bold tracking-widest text-sm uppercase">Conectando con Aura Server...</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold mb-2">Error de Stream</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            El enlace directo no respondió. Esto puede deberse a restricciones del servidor o formato no soportado.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;