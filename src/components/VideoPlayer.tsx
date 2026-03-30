"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Loader2, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    setError(null);
    setLoading(true);

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-theme-city");
    videoRef.current.appendChild(videoElement);

    const player = (playerRef.current = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      sources: [{ 
        src: url, 
        // Intentamos detectar si es live (.ts) o movie (.mkv)
        type: url.includes(".ts") ? "video/mp2t" : "video/mp4" 
      }],
      userActions: {
        hotkeys: true
      }
    }, () => {
      console.log("[VideoPlayer] Player ready");
    }));

    player.on("playing", () => {
      setLoading(false);
      setError(null);
    });

    player.on("waiting", () => setLoading(true));

    player.on("error", () => {
      const errorObj = player.error();
      setError(`Error de reproducción: ${errorObj ? errorObj.message : 'Desconocido'}`);
      setLoading(false);
    });

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center group">
      <div ref={videoRef} className="w-full h-full" />
      
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest animate-pulse">
            Sincronizando Stream...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No se pudo cargar el video</h3>
          <p className="text-zinc-500 text-sm max-w-xs">{error}</p>
          <p className="text-zinc-600 text-[10px] mt-4 uppercase font-black">Verifica que el servidor kytv.xyz esté online</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;