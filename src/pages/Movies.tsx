Xtream y estética premium.">
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Film, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { findBestIptvMatch } from "@/lib/iptv-match";
import { showError } from "@/utils/toast";

const CORS_PROXY = "https://proxy.cors.sh/";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [iptvStreamId, setIptvStreamId] = useState<string | null>(null);

  // 1. Obtener Configuración de Supabase
  const { data: config } = useQuery({
    queryKey: ["providerConfig"],
    queryFn: async () => {
      const { data, error } = await supabase.from('provider_config').select('*').single();
      if (error) throw error;
      return data;
    }
  });

  // 2. Obtener Streams de Xtream (para el matching)
  const { data: iptvData, isLoading: loadingIptv } = useQuery({
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

  // Lógica cuando el usuario elige una película
  const handleSelectMovie = (tmdbMovie: any) => {
    if (!iptvData?.data) {
      showError("Sincronizando biblioteca, intenta en un momento...");
      return;
    }

    const match = findBestIptvMatch(tmdbMovie.name, iptvData.data);
    
    if (match) {
      setSelectedMovie(tmdbMovie);
      setIptvStreamId(match.stream_id);
    } else {
      showError("Esta película no está disponible en tu servidor actual.");
    }
  };

  if (loadingIptv) {
    return (
      <Layout>
        <div className="flex flex-col h-96 items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-bold animate-pulse">Aura TV: Sincronizando con Servidor...</p>
        </div>
      </Layout>
    );
  }

  if (selectedMovie && iptvStreamId && config) {
    const streamUrl = `${config.url}/movie/${config.user}/${config.pass}/${iptvStreamId}.mp4`;
    
    return (
      <Layout>
        <div className="space-y-6">
          <button 
            onClick={() => { setSelectedMovie(null); setIptvStreamId(null); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus:ring-2 focus:ring-white p-2 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" /> Volver al Menú
          </button>
          
          <div className="relative group aspect-video rounded-3xl overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.7)] bg-black">
            <VideoPlayer url={`${CORS_PROXY}${streamUrl}`} />
          </div>

          <div className="p-8 bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/10">
            <h1 className="text-4xl font-black mb-4">{selectedMovie.name}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Reproduciendo desde servidor seguro: <span className="text-primary font-mono text-sm">{iptvStreamId}</span>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-black tracking-tighter">CINE</h1>
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-full px-6 flex items-center gap-3 border border-white/5">
              <Search className="h-5 w-5 text-white/50" />
              <input 
                placeholder="Buscar en Aura TV..." 
                className="bg-transparent border-none outline-none text-lg w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-white/60">Biblioteca Recomendada</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {(iptvData?.data || [])
              .filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, 30)
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