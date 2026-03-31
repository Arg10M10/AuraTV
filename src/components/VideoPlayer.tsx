"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Loader2, X, Pause, RotateCcw, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  onClose: () => void;
}

const VideoPlayer = ({ url, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // COMUNICACIÓN SEGURA: Notificamos al proceso principal de Electron
    if ((window as any).electronAPI) {
      (window as any).electronAPI.notifyVideoStart(url);
    }

    const player = (playerRef.current = videojs(videoRef.current, {
      autoplay: true,
      controls: false,
      sources: [{ 
        src: url, 
        type: url.includes(".mkv") ? "video/x-matroska" : "video/mp4" 
      }]
    }));

    player.on("playing", () => setLoading(false));
    player.on("error", () => {
      setError("Error de formato o conexión");
      setLoading(false);
    });

    return () => {
      if (playerRef.current) playerRef.current.dispose();
    };
  }, [url]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden group">
      {/* CAPA tvOS GLASSMORPHISM */}
      <div className="absolute inset-0 z-[110] flex flex-col justify-between p-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-black/90 via-transparent to-black/50">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-white/5 backdrop-blur-[25px] p-6 rounded-[2rem] border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Aura TV</h2>
            <p className="text-primary font-bold text-[10px] tracking-[0.4em] mt-1">DIRECT STREAMING</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 backdrop-blur-3xl p-6 rounded-full border border-white/10 transition-all hover:scale-110">
            <X className="h-10 w-10 text-white" />
          </button>
        </div>

        <div className="space-y-12 pointer-events-auto">
          <div className="flex items-center justify-center gap-16">
             <button className="text-white/40 hover:text-white transition-all transform hover:scale-110">
               <RotateCcw className="h-12 w-12" />
             </button>
             <button className="bg-white text-black p-8 rounded-full hover:scale-110 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
               <Pause className="h-14 w-14 fill-black" />
             </button>
             <div className="text-white/40 hover:text-white transform rotate-180 hover:scale-110">
               <RotateCcw className="h-12 w-12" />
             </div>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
            <div className="h-full bg-white w-1/4 shadow-[0_0_15px_white]" />
          </div>
        </div>
      </div>

      <video ref={videoRef} className="w-full h-full object-contain" />

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[120]">
          <Loader2 className="h-20 w-20 animate-spin text-primary" />
          <p className="mt-8 text-white font-black tracking-[0.5em] uppercase text-xs animate-pulse">Sincronizando Hardware</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;