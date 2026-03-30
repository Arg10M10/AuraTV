"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, Server, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findBestIptvMatch } from "@/lib/iptv-match";
import { Button } from "@/components/ui/button";

// Usamos un proxy CORS público para evitar errores de Mixed Content (HTTP en HTTPS)
const CORS_PROXY = "https://corsproxy.io/?";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [playMode, setPlayMode] = useState<"xtream" | "vidsrc" | null>(null);
  const [xtreamUrl, setXtreamUrl] = useState<string | null>(null);

  // 1. Carga de TMDB (Interfaz Visual)
  const { data: tmdbMovies, isLoading: loadingTmdb } = useQuery({
    queryKey: ["tmdbMovies", searchQuery],
    queryFn: async () => {
      const endpoint = searchQuery ? "/search/movie" : "/movie/popular";
      const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
        body: { endpoint, query: searchQuery }
      });
      if (error) throw error;
      return data.results || [];
    },
  });

  // 2. Carga Silenciosa del Catálogo IPTV (Caché en background)
  const { data: iptvData } = useQuery({
    queryKey: ["xtreamVodCache"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('xtream-proxy', {
        body: { action: "get_vod_streams" }
      });
      if (error) throw error;
      return {
        streams: Array.isArray(data.data) ? data.data : [],
        creds: data.credentials
      };
    },
    staleTime: 1000 * 60 * 60, // Caché de 1 hora
  });

  // 3. Lógica de Matching al hacer clic
  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
    
    if (iptvData?.streams && iptvData?.creds) {
      const match = findBestIptvMatch(movie.title, movie.release_date, iptvData.streams);
      
      if (match) {
        // Construcción de la URL de Video
        const { server, user, pass } = iptvData.creds;
        const extension = match.container_extension || "mp4";
        // Pasamos la URL por el proxy CORS para evitar bloqueos de Cleartext/Mixed Content
        const rawUrl = `${server}/movie/${user}/${pass}/${match.stream_id}.${extension}`;
        setXtreamUrl(`${CORS_PROXY}${encodeURIComponent(rawUrl)}`);
        setPlayMode("xtream");
        return;
      }
    }
    
    // Si no hay match o no ha cargado Xtream, vamos directo al respaldo
    setPlayMode("vidsrc");
  };

  // Modo Reproductor
  if (selectedMovie && playMode) {
    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-zinc-950 text-white p-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => { setSelectedMovie(null); setPlayMode(null); setXtreamUrl(null); }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2"
            >
              <ArrowLeft className="h-5 w-5" /> Volver al Catálogo
            </button>

            {/* Botón de Respaldo Manual */}
            {playMode === "xtream" && (
              <Button 
                variant="outline" 
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                onClick={() => setPlayMode("vidsrc")}
              >
                <Server className="mr-2 h-4 w-4" />
                Ver en Servidor de Respaldo
              </Button>
            )}
          </div>
          
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5">
            {playMode === "xtream" && xtreamUrl ? (
              <VideoPlayer url={xtreamUrl} />
            ) : (
              <iframe
                src={`https://vidsrc.to/embed/movie/${selectedMovie.id}`}
                className="w-full h-full border-0"
                allowFullScreen
              />
            )}
          </div>

          <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
            <img 
              src={`https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`} 
              alt={selectedMovie.title}
              className="w-48 rounded-xl shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-black">{selectedMovie.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-zinc-400">
                <span>{selectedMovie.release_date?.substring(0, 4)}</span>
                <span className="flex items-center gap-1 text-primary">
                  <PlayCircle className="h-4 w-4" /> 
                  {playMode === "xtream" ? "Servidor Principal (Xtream)" : "Servidor de Respaldo (VidSrc)"}
                </span>
              </div>
              <p className="text-zinc-300 mt-6 max-w-3xl leading-relaxed">
                {selectedMovie.overview || "Sin sinopsis disponible."}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12 bg-zinc-950 text-white p-8 rounded-3xl min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-5xl font-black tracking-tighter italic">AURA <span className="text-primary not-italic">CINE</span></h1>
          <div className="bg-white/5 backdrop-blur-xl p-3 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-80">
            <Search className="h-5 w-5 text-white/40" />
            <input 
              placeholder="Buscar en TMDB..." 
              className="bg-transparent border-none outline-none text-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            <h2 className="text-xl font-bold text-white/40 uppercase tracking-widest">
              {searchQuery ? "Resultados de Búsqueda" : "Películas Populares"}
            </h2>
          </div>
          
          {loadingTmdb ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : tmdbMovies?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {tmdbMovies.map((movie: any) => (
                <ContentCard 
                  key={movie.id}
                  title={movie.title}
                  imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg"}
                  onClick={() => handleSelectMovie(movie)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 italic">
              No se encontraron resultados.
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Movies;