"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, AlertCircle, ServerCrash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findBestIptvMatch } from "@/lib/iptv-match";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Lista de servidores extraída de tu configuración
const SERVERS = [
  "http://kytv.xyz",
  "http://cdn-ky.com",
  "http://name-port.to"
];

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [streamData, setStreamData] = useState<{ id: string | number, ext: string, user: string, pass: string } | null>(null);
  const [serverIndex, setServerIndex] = useState(0);

  // 1. Carga de TMDB
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

  // 2. Carga del Catálogo IPTV (VOD)
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

  // 3. Lógica de Matching
  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
    setStreamData(null);
    setServerIndex(0); // Reiniciar al primer servidor
    
    if (iptvData?.streams && iptvData?.creds) {
      const match = findBestIptvMatch(movie.title, movie.release_date, iptvData.streams);
      
      if (match) {
        setStreamData({
          id: match.stream_id,
          ext: match.container_extension || "mp4",
          user: iptvData.creds.user,
          pass: iptvData.creds.pass
        });
      } else {
        toast.error("Esta película no está disponible en tu servidor premium.");
      }
    } else {
      toast.info("Sincronizando catálogo premium...");
    }
  };

  const handleNextServer = () => {
    const nextIndex = (serverIndex + 1) % SERVERS.length;
    setServerIndex(nextIndex);
    toast.success(`Cambiando al servidor: ${SERVERS[nextIndex]}`);
  };

  // Generar URL dinámica basada en el servidor actual
  const currentUrl = streamData 
    ? `${SERVERS[serverIndex]}/movie/${streamData.user}/${streamData.pass}/${streamData.id}.${streamData.ext}`
    : null;

  if (selectedMovie) {
    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-zinc-950 text-white p-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => { setSelectedMovie(null); setStreamData(null); }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2"
            >
              <ArrowLeft className="h-5 w-5" /> Volver al Catálogo
            </button>
            
            {streamData && (
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                onClick={handleNextServer}
              >
                <ServerCrash className="mr-2 h-4 w-4" />
                Cambiar Servidor ({serverIndex + 1}/{SERVERS.length})
              </Button>
            )}
          </div>
          
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5">
            {currentUrl ? (
              <VideoPlayer 
                url={currentUrl} 
                onNextServer={handleNextServer}
                serverName={SERVERS[serverIndex]}
              />
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
              
              {currentUrl && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-zinc-500 font-mono break-all">
                    <span className="text-primary font-bold">URL Actual:</span> {currentUrl.replace(streamData.pass, '***')}
                  </p>
                </div>
              )}
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