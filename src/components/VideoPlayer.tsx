import ReactPlayer from "react-player";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Tv } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(!url);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIsEmpty(!url);
  }, [url]);

  const handleReady = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = (e: any) => {
    console.error("Error de ReactPlayer:", e);
    setIsLoading(false);
    setError("El canal no está disponible o la conexión fue bloqueada (posible problema de CORS o canal caído).");
  };

  const handleBuffer = () => {
    if (!error) setIsLoading(true);
  };

  const handleBufferEnd = () => {
    setIsLoading(false);
  };

  if (isEmpty) {
    return (
      <div className="aspect-video w-full bg-black flex flex-col items-center justify-center text-white">
        <Tv className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">Selecciona un canal</p>
        <p className="text-sm text-gray-300">Elige un país y luego un canal de la lista.</p>
      </div>
    );
  }

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
        config={{
          file: {
            forceHLS: true,
          },
        }}
      />
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando canal...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white pointer-events-none p-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-lg font-semibold text-center mb-2">No se pudo cargar el canal</p>
          <p className="text-sm text-gray-300 text-center">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;