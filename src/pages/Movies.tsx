"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, AlertCircle, ServerCrash, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const [serverIndex, setServerIndex] = useState(0);

  // Carga del Catálogo IPTV (VOD) directamente
  const { data: iptvData, isLoading } = useQuery({
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
    staleTime: 1000 * 60 * 60, // Cache de 1 hora
  });

  // Filtrado local súper rápido (limitado a 150 para no colapsar el navegador)
  const filteredMovies = useMemo(() => {
    if (!iptvData?.streams) return [];
    
    if (!searchQuery) {
      return iptvData.streams.slice(0, 150);
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    return iptvData.streams
      .filter((m: any) => m.name?.toLowerCase().includes(lowerQuery))
      .slice(0, 150);
  }, [iptvData?.streams, searchQuery]);

  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
    setServerIndex(0); // Reiniciar al primer servidor
  };

  const handleNextServer = () => {
    const nextIndex = (serverIndex + 1) % SERVERS.length;
    setServerIndex(nextIndex);
    toast.success(`Cambiando al servidor: ${SERVERS[nextIndex]}`);
  };

  // Generar URL dinámica basada en el servidor actual y los datos de Xtream
  const currentUrl = selectedMovie && iptvData?.creds
    ? `${SERVERS[serverIndex]}/movie/${iptvData.creds.user}/${iptvData.creds.pass}/${selectedMovie.stream_id}.${selectedMovie.container_extension || 'mp4'}`
    : null;

  if (selectedMovie) {
    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-zinc-950 text-white p-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2"
            >
              <ArrowLeft className="h-5 w-5" /> Volver al Catálogo
            </button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              onClick={handleNextServer}
            >
              <ServerCrash className="mr-2 h-4 w-4" />
              Cambiar Servidor ({serverIndex + 1}/{SERVERS.length})
            </Button>
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
                <p>Error al generar el enlace de la película.</p>
              </div>
            )}
          </div>

          <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
            {selectedMovie.stream_icon ? (
              <img 
                src={selectedMovie.stream_icon} 
                alt={selectedMovie.name}
                className="w-48 rounded-xl shadow-lg object-cover aspect-[2/3] bg-zinc-900"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
              />
            ) : (
              <div className="w-48 aspect-[2/3] rounded-xl shadow-lg bg-zinc-900 flex items-center justify-center">
                <Film className="h-12 w-12 text-zinc-700" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl font-black">{selectedMovie.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-zinc-400">
                {selectedMovie.rating && <span>⭐ {selectedMovie.rating}</span>}
                <span className="text-primary font-bold">Servidor Premium (Xtream)</span>
                <span className="uppercase text-xs border border-zinc-700 px-2 py-1 rounded">
                  {selectedMovie.container_extension || 'MP4'}
                </span>
              </div>
              
              {currentUrl && (
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 inline-block">
                  <p className="text-xs text-zinc-500 font-mono break-all">
                    <span className="text-primary font-bold">URL Actual:</span> {currentUrl.replace(iptvData?.creds.pass, '***')}
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
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter italic">AURA <span className="text-primary not-italic">CINE</span></h1>
            <p className="text-zinc-500 text-sm font-medium">
              {iptvData?.streams ? `${iptvData.streams.length} películas disponibles` : 'Cargando catálogo...'}
            </p>
          </div>
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
            <h2 className="text-xl font-bold text-white/40 uppercase tracking-widest">
              {searchQuery ? "Resultados de Búsqueda" : "Catálogo Premium"}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-zinc-500 animate-pulse">Sincronizando miles de películas...</p>
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredMovies.map((movie: any) => (
                <ContentCard 
                  key={movie.stream_id}
                  title={movie.name}
                  imageUrl={movie.stream_icon || "/placeholder.svg"}
                  onClick={() => handleSelectMovie(movie)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 italic">
              No se encontraron películas con ese nombre.
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Movies;