"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findBestIptvMatch } from "@/lib/iptv-match";
import { toast } from "sonner";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
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

  // 2. Carga Silenciosa del Catálogo IPTV
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
    staleTime: 1000 * 60 * 60,
  });

  // 3. Lógica de Matching y Debug Profundo
  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
    setXtreamUrl(null);
    
    if (iptvData?.streams && iptvData?.creds) {
      const match = findBestIptvMatch(movie.title, movie.release_date, iptvData.streams);
      
      if (match) {
        const { server, user, pass } = iptvData.creds;
        const extension = match.container_extension || "mp4";
        
        // Construcción de la URL Directa (SIN PROXY)
        const rawUrl = `${server}/movie/${user}/${pass}/${match.stream_id}.${extension}`;
        
        // ==========================================
        // DEBUG PROFUNDO EN CONSOLA
        // ==========================================
        console.log("🔴 DEBUG PROFUNDO - XTREAM CODES 🔴");
        console.log("1. Servidor (Host:Puerto):", server);
        console.log("2. Usuario:", user);
        console.log("3. Password:", pass ? "***OCULTO***" : "VACÍO");
        console.log("4. Stream ID:", match.stream_id);
        console.log("5. Extensión:", extension);
        console.log("▶️ URL FINAL A REPRODUCIR:", rawUrl);
        console.log("==========================================");

        // Usamos la URL directa. El proxy rompe el streaming de video.
        setXtreamUrl(rawUrl);
      } else {
        console.warn("❌ Película no encontrada en Xtream:", movie.title);
        toast.error("Esta película no está disponible en tu servidor premium.");
      }
    } else {
      toast.info("Sincronizando catálogo premium...");
    }
  };

  if (selectedMovie) {
    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-zinc-950 text-white p-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => { setSelectedMovie(null); setXtreamUrl(null); }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2"
            >
              <ArrowLeft className="h-5 w-5" /> Volver al Catálogo
            </button>
          </div>
          
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5">
            {xtreamUrl ? (
              <VideoPlayer url={xtreamUrl} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                <p>Película no encontrada en el servidor premium.</p>
              </div>
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
                <span className="text-primary font-bold">Servidor Premium (Xtream)</span>
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