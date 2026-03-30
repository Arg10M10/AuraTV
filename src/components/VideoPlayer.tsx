"use client";

import ReactPlayer from "react-player";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle, ShieldAlert } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showMixedContentWarning, setShowMixedContentWarning] = useState(false);

  // Si se queda cargando más de 8 segundos, probablemente sea un bloqueo de Mixed Content (HTTP en HTTPS)
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
                  // Forzamos el User-Agent para evitar bloqueos 403 del servidor Xtream
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 p-6 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          
          {!showMixedContentWarning ? (
            <p className="text-white font-bold tracking-widest text-sm uppercase">Conectando a Xtream Codes...</p>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl max-w-md">
              <ShieldAlert className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-yellow-500 font-bold mb-1">Posible bloqueo de seguridad del navegador</p>
              <p className="text-zinc-300 text-xs">
                Tu servidor IPTV usa <b>HTTP</b> pero la app está en <b>HTTPS</b>. <br/><br/>
                Para ver el video, haz clic en el <b>icono del candado</b> en la barra de direcciones de tu navegador, ve a "Configuración del sitio" y permite el <b>"Contenido no seguro" (Insecure content)</b>.
              </p>
            </div>
          )}
          
          <div className="mt-8 text-xs text-zinc-600 font-mono break-all bg-black/50 p-2 rounded">
            Intentando cargar: {url}
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-20 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold mb-2">Error de Reproducción</h3>
          <p className="text-muted-foreground text-sm max-w-md mb-4">
            El servidor rechazó la conexión o el formato no es compatible.
          </p>
          <div className="text-xs text-zinc-500 font-mono break-all bg-black/30 p-3 rounded-lg">
            URL Fallida: {url}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;