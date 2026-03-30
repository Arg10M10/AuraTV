"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findBestIptvMatch } from "@/lib/iptv-match";
import { showError } from "@/utils/toast";

const CORS_PROXY = "https://proxy.cors.sh/";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [iptvStreamId, setIptvStreamId] = useState<string | null>(null);

  // 1. Obtener Configuración (con catch para evitar crash)
  const { data: config, isError: configError } = useQuery({
    queryKey: ["providerConfig"],
    queryFn: async () => {
      const { data, error } = await supabase.from('provider_config').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
    retry: 1
  });

  // 2. Obtener Streams (solo si hay config)
  const { data: iptvData, isLoading: loadingIptv, error: fetchError } = useQuery({
    queryKey: ["xtreamMovies"],
    enabled: !!config,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('xtream-proxy', {
        body: { action: "get_vod_streams" }
      });
      if (error) throw error;
      return data;
    }
  });

  const handleSelectMovie = (tmdbMovie: any) => {
    if (!iptvData?.data) {
      showError("Sincronizando biblioteca...");
      return;
    }
    const match = findBestIptvMatch(tmdbMovie.name, iptvData.data);
    if (match) {
      setSelectedMovie(tmdbMovie);
      setIptvStreamId(match.stream_id);
    } else {
      showError("No disponible en este servidor.");
    }
  };

  // Pantalla de Carga
  if (loadingIptv) {
    return (
      <Layout>
        <div className="flex flex-col h-[70vh] items-center justify-center space-y-4 bg-zinc-950 text-white rounded-3xl">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-bold animate-pulse">Sincronizando Aura TV...</p>
        </div>
      </Layout>
    );
  }

  // Pantalla de Error de Configuración
  if (configError || (!config && !loadingIptv)) {
    return (
      <Layout>
        <div className="flex flex-col h-[70vh] items-center justify-center p-8 text-center bg-zinc-950 text-white rounded-3xl border border-white/10">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Configuración Requerida</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            No se encontró la tabla 'provider_config' o está vacía. 
            Por favor, asegúrate de haber insertado tus credenciales de Xtream en Supabase.
          </p>
        </div>
      </Layout>
    );
  }

  // Modo Reproductor
  if (selectedMovie && iptvStreamId && config) {
    const streamUrl = `${config.url}/movie/${config.user}/${config.pass}/${iptvStreamId}.mp4`;
    
    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-zinc-950 text-white p-4 rounded-3xl">
          <button 
            onClick={() => { setSelectedMovie(null); setIptvStreamId(null); }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2"
          >
            <ArrowLeft className="h-5 w-5" /> Volver al Menú
          </button>
          
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5">
            <VideoPlayer url={`${CORS_PROXY}${streamUrl}`} />
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-black">{selectedMovie.name}</h1>
            <p className="text-zinc-500 mt-2">Streaming en Alta Definición desde Aura Server</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Pantalla Principal (Grid)
  return (
    <Layout>
      <div className="space-y-12 bg-zinc-950 text-white p-8 rounded-3xl min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-5xl font-black tracking-tighter italic">AURA <span className="text-primary not-italic">CINE</span></h1>
          <div className="bg-white/5 backdrop-blur-xl p-3 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-80">
            <Search className="h-5 w-5 text-white/40" />
            <input 
              placeholder="Buscar película..." 
              className="bg-transparent border-none outline-none text-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section>
          <h2 className="text-xl font-bold mb-8 text-white/40 uppercase tracking-widest">Catálogo Disponible</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {(iptvData?.data || [])
              .filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, 40)
              .map((movie: any) => (
                <ContentCard 
                  key={movie.stream_id}
                  title={movie.name}
                  imageUrl={movie.stream_icon}
                  onClick={() => handleSelectMovie(movie)}
                />
              ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Movies;