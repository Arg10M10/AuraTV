"use client";

import ReactPlayer from "react-player";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle, ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  url: string;
  onNextServer?: () => void;
  serverName?: string;
}

const VideoPlayer = ({ url, onNextServer, serverName }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showMixedContentWarning, setShowMixedContentWarning] = useState(false);

  // Resetear estados cuando cambia la URL (al cambiar de servidor)
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setShowMixedContentWarning(false);
  }, [url]);

  // Detector de Mixed Content o Timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading && url) {
      timeout = setTimeout(() => {
        if (url.startsWith("http://") && window.location.protocol === "https:") {
          setShowMixedContentWarning(true);
        }
      }, 8000);
    }
    return () => clearTimeout(timeout);
  }, [isLoading, url]);

  return (
    <div className="relative w-full h-full bg-black group rounded-3xl overflow-hidden">
      {url ? (
        <ReactPlayer
          key={url} // Fuerza a recargar el componente si cambia la URL
          url={url}
          controls
          playing
          width="100%"
          height="100%"
          onReady={() => {
            setIsLoading(false);
            setShowMixedContentWarning(false);
          }}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          onError={(e) => {
            console.error("🔴 Error en reproductor:", e);
            setIsLoading(false);
            setHasError(true);
          }}
          config={{
            file: {
              forceVideo: true,
              attributes: {
                crossOrigin: "anonymous",
              },
              hlsOptions: {
                xhrSetup: function(xhr: any) {
                  xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 p-6 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          
          {!showMixedContentWarning ? (
            <p className="text-white font-bold tracking-widest text-sm uppercase">
              Conectando a {serverName || "Servidor"}...
            </p>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/50 p-6 rounded-xl max-w-md flex flex-col items-center">
              <ShieldAlert className="h-10 w-10 text-yellow-500 mb-4" />
              <p className="text-yellow-500 font-bold mb-2 text-lg">Bloqueo de Seguridad (HTTPS)</p>
              <p className="text-zinc-300 text-sm mb-6">
                Tu navegador está bloqueando el video porque el servidor es HTTP. Haz clic en el candado de la barra de direcciones y permite el <b>Contenido no seguro</b>.
              </p>
              {onNextServer && (
                <Button onClick={onNextServer} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                  <RefreshCw className="mr-2 h-4 w-4" /> Intentar con otro servidor
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-white">Error de Reproducción</h3>
          <p className="text-zinc-400 text-sm max-w-md mb-8">
            El servidor {serverName} no responde o el formato no es compatible.
          </p>
          
          {onNextServer && (
            <Button onClick={onNextServer} size="lg" className="bg-primary hover:bg-primary/80 text-white">
              <RefreshCw className="mr-2 h-5 w-5" /> Cambiar de Servidor
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;