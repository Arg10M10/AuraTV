"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Loader2, X } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  onClose: () => void;
}

const VideoPlayer = ({ url, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  // Convertimos la URL original en una URL de Proxy
  const proxiedUrl = `https://vspullgchtzqgdclqjaw.supabase.co/functions/v1/video-proxy?url=${encodeURIComponent(url)}`;

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-theme-city");
    videoRef.current.appendChild(videoElement);

    const player = (playerRef.current = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{ 
        src: proxiedUrl, 
        type: url.includes(".mkv") ? "video/webm" : "video/mp4" 
      }]
    }));

    player.on("playing", () => setLoading(false));
    player.on("waiting", () => setLoading(true));

    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [proxiedUrl, url]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all"
      >
        <X className="h-8 w-8" />
      </button>

      <div ref={videoRef} className="w-full max-w-6xl aspect-video shadow-2xl" />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-white font-bold tracking-widest uppercase text-xs">Conectando Túnel Seguro...</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;