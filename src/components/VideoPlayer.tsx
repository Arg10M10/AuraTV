"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [isBuffering, setIsBuffering] = useState(true);

  // Cada vez que cambie la URL, mostramos el mensaje de carga
  useEffect(() => {
    setIsBuffering(true);
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Mensaje de carga mientras el navegador negocia el stream */}
      {isBuffering && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-white font-medium text-sm tracking-widest uppercase animate-pulse">
            Cargando Stream...
          </p>
        </div>
      )}

      <video
        key={url} // Forzamos al navegador a recrear el elemento si cambia la URL
        className="w-full h-full"
        controls
        autoPlay
        playsInline
        // ATRIBUTOS CLAVE SOLICITADOS
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        // Eventos para controlar la UI de carga
        onLoadStart={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/x-matroska" />
        Tu navegador no soporta la reproducción de video nativa.
      </video>
    </div>
  );
};

export default VideoPlayer;