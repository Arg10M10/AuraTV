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

  // Obtenemos películas y credenciales en una sola llamada a la función segura
  const { data: iptvResult, isLoading, error: fetchError } = useQuery({
    queryKey: ["xtreamMoviesData"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('xtream-proxy', {
        body: { action: "get_vod_streams" }
      });
      if (error) throw error;
      return {
        streams: data.data,
        creds: data.credentials
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutos de caché
  });

  const handleSelectMovie = (tmdbMovie: any) => {
    if (!iptvResult?.streams) {
      showError("Sincronizando biblioteca...");
      return;
    }
    // Buscamos el ID del stream que coincide con el nombre de la película
    const match = findBestIptvMatch(tmdbMovie.name, iptvResult.streams);
    if (match) {
      setSelectedMovie(tmdbMovie);
      setIptvStreamId(match.stream_id);
    } else {
      showError("Película no encontrada en el servidor.");
    }
  };

  // Pantalla de Carga
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col h-[70vh] items-center justify-center space-y-4 bg-zinc-950 text-white rounded-3xl">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-bold animate-pulse">Sincronizando Aura Cine...</p>
        </div>
      </Layout>
    );
  }

  // Pantalla de Error
  if (fetchError) {
    return (
      <Layout>
        <div className="flex flex-col h-[70vh] items-center justify-center p-8 text-center bg-zinc-950 text-white rounded-3xl border border-white/10">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Error de Conexión</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            No se pudo conectar con el servidor de streaming. Revisa tu configuración en Supabase.
          </p>
        </div>
      </Layout>
    );
  }

  // Modo Reproductor
  if (selectedMovie && iptvStreamId && iptvResult?.creds) {
    const { server, user, pass } = iptvResult.creds;
    // Construimos la URL de la película usando las credenciales dinámicas
    const streamUrl = `${server}/movie/${user}/${pass}/${iptvStreamId}.mp4`;
    
    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-zinc-950 text-white p-4 rounded-3xl">
          <button 
            onClick={() => { setSelectedMovie(null); setIptvStreamId(null); }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2"
          >
            <ArrowLeft className="h-5 w-5" /> Volver al Catálogo
          </button>
          
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5">
            <VideoPlayer url={`${CORS_PROXY}${streamUrl}`} />
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-black">{selectedMovie.name}</h1>
            <p className="text-zinc-500 mt-2">Streaming en Alta Definición desde {server}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Pantalla Principal (Grid de películas)
  const displayMovies = (iptvResult?.streams || [])
    .filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 50);

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
          <div className="flex items-center gap-2 mb-8">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            <h2 className="text-xl font-bold text-white/40 uppercase tracking-widest">Películas Recientes</h2>
          </div>
          
          {displayMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {displayMovies.map((movie: any) => (
                <ContentCard 
                  key={movie.stream_id}
                  title={movie.name}
                  imageUrl={movie.stream_icon}
                  onClick={() => handleSelectMovie(movie)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 italic">
              No se encontraron resultados para "{searchQuery}"
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Movies;