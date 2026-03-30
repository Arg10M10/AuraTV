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
                // Atributos nativos del elemento <video>
                crossOrigin: "anonymous",
              },
              hlsOptions: {
                xhrSetup: function(xhr: any) {
                  // Forzamos el User-Agent para evitar bloqueos del servidor Xtream
                  xhr.setRequestHeader('User-Agent', 'IPTVSmarters/1.0');
                }
              }
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white/20">
          Esperando señal del servidor premium...
        </div>
      )}

      {isLoading && url && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-white font-bold tracking-widest text-sm uppercase">Conectando a Xtream Codes...</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold mb-2">Error de Reproducción</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            El servidor rechazó la conexión. Verifica la consola para ver la URL generada.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;