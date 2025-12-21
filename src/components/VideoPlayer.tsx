import ReactPlayer from "react-player";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reiniciar estado al cambiar de canal
  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, [url]);

  const handleReady = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = (e: any) => {
    console.error("Error de ReactPlayer:", e);
    setIsLoading(false);
    setError(true);
  };

  const handleBuffer = () => {
    setIsLoading(true);
  };

  const handleBufferEnd = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative aspect-video w-full bg-black">
      <ReactPlayer
        url={url}
        controls
        playing
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
        onReady={handleReady}
        onError={handleError}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
      />
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white pointer-events-none">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-lg font-semibold">No se pudo cargar el canal</p>
          <p className="text-sm text-gray-300 text-center px-4">
            La transmisión puede no estar disponible o haber un problema de red.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;