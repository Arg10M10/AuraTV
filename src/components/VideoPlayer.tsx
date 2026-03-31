"use client";

import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { CapacitorVideoPlayer } from "capacitor-video-player";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Loader2, X, Play, Pause, RotateCcw } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  onClose: () => void;
}

const VideoPlayer = ({ url, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const isWeb = Capacitor.getPlatform() === 'web';

  // URL con proxy solo para Web (para evitar el 403 en navegador)
  const proxiedUrl = `https://vspullgchtzqgdclqjaw.supabase.co/functions/v1/video-proxy?url=${encodeURIComponent(url)}`;

  useEffect(() => {
    const initPlayer = async () => {
      if (!isWeb) {
        // MODO ANDROID: Uso de motor nativo para soporte MKV y bypass directo
        try {
          await CapacitorVideoPlayer.initPlayer({
            mode: 'fullscreen',
            url: url,
            playerId: 'fullscreen',
            componentTag: 'div',
            httpHeaders: {
              'User-Agent': 'IPTVSmarters/1.0.0'
            }
          });
          setLoading(false);
          
          // Escuchamos cuando el reproductor nativo se cierra para cerrar el componente
          document.addEventListener('jeepCapVideoPlayerExit', () => onClose(), { once: true });
        } catch (e) {
          console.error("Error en reproductor nativo:", e);
          onClose();
        }
      } else {
        // MODO WEB: Video.js con el túnel de Supabase
        if (!videoRef.current) return;
        const videoElement = document.createElement("video-js");
        videoElement.classList.add("vjs-big-play-centered", "vjs-theme-city");
        videoRef.current.appendChild(videoElement);

        const player = (playerRef.current = videojs(videoElement, {
          autoplay: true,
          controls: false, // Desactivamos los de Video.js para usar nuestra capa Apple TV
          responsive: true,
          fluid: true,
          sources: [{ 
            src: proxiedUrl, 
            type: url.includes(".mkv") ? "video/webm" : "video/mp4" 
          }]
        }));

        player.on("playing", () => setLoading(false));
        player.on("waiting", () => setLoading(true));
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [url, isWeb]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      {/* CAPA DE INTERFAZ ESTILO APPLE TV (Overlay) */}
      <div className="absolute inset-0 z-[110] flex flex-col justify-between p-12 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 hover:opacity-100 transition-opacity duration-500">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic tracking-tighter text-white">REPRODUCIENDO</h2>
            <p className="text-primary font-bold text-xs uppercase tracking-widest">Aura TV Private Stream</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-full text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        {/* CONTROLES INFERIORES (Solo visuales en modo nativo, funcionales en web) */}
        <div className="flex items-center justify-center gap-12 pointer-events-auto mb-8">
           <button className="text-white/40 hover:text-white transition-colors">
             <RotateCcw className="h-10 w-10" />
           </button>
           <button className="bg-white text-black p-6 rounded-full hover:scale-110 transition-transform">
             <Pause className="h-12 w-12 fill-black" />
           </button>
           <div className="text-white/40 hover:text-white transition-colors transform rotate-180">
             <RotateCcw className="h-10 w-10" />
           </div>
        </div>
      </div>

      {/* SUPERFICIE DE VIDEO */}
      {isWeb && <div ref={videoRef} className="w-full max-w-full aspect-video pointer-events-auto" />}

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[120]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="mt-6 text-white font-black tracking-[0.3em] uppercase text-xs animate-pulse">Sincronizando con {isWeb ? 'Túnel Seguro' : 'Motor Nativo'}</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;