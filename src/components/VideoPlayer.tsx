import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  return (
    <div className="relative aspect-video w-full bg-black">
      <ReactPlayer
        url={url}
        controls
        playing
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
        // Añadimos un fallback por si el stream no carga
        fallback={<div className="flex h-full w-full items-center justify-center text-white">Cargando canal...</div>}
        onError={() => console.error("Error al cargar el stream de video.")}
      />
    </div>
  );
};

export default VideoPlayer;