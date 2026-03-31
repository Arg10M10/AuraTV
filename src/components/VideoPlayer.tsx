"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2, X, Play, MonitorPlay, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  onClose: () => void;
}

const VideoPlayer = ({ url, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMkv = url.toLowerCase().includes(".mkv");

  const openInExternal = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.openExternal(url);
      onClose();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Si es MKV, mostramos aviso directo ya que Chrome no lo soporta
    if (isMkv) {
      setLoading(false);
      setError("MKV_DETECTED");
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setError("AUTOPLAY_BLOCKED"));
        setLoading(false);
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
           setError("STREAM_ERROR");
           setLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Soporte nativo (Safari/iOS)
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        setLoading(false);
      });
    } else {
      setError("NO_HLS_SUPPORT");
      setLoading(false);
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [url, isMkv]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="absolute top-8 right-8 z-[110]">
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-xl border border-white/10 transition-all">
          <X className="h-8 w-8 text-white" />
        </button>
      </div>

      <video 
        ref={videoRef} 
        className="w-full h-full object-contain"
        controls={!loading && !error}
      />

      {(loading && !error) && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center space-y-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs animate-pulse">Sincronizando flujo de datos...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-12 text-center space-y-8">
          <div className="bg-primary/10 p-8 rounded-full">
            <MonitorPlay className="h-20 w-20 text-primary" />
          </div>
          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Formato de Cine Detectado</h2>
            <p className="text-zinc-400 font-medium">
              Este contenido (.mkv / AC3) requiere el motor de renderizado de **VLC Media Player** para una reproducción fluida en 4K.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={openInExternal}
              className="bg-primary text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-tighter text-lg hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-2xl shadow-primary/20"
            >
              <Play className="h-6 w-6 fill-current" />
              Abrir en VLC
            </button>
            <button onClick={onClose} className="text-zinc-500 font-bold hover:text-white transition-colors">
              Volver al catálogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;