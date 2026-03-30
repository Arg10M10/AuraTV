"use client";

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, Film, AlertCircle } from "lucide-react";
import { useXtreamQuery, getXtreamMovieUrl } from "@/hooks/useXtream";
import { proxyImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const { data: queryResult, isLoading: isLoadingList, error, refetch } = useXtreamQuery("get_vod_streams");

  const iptvData = queryResult?.data;
  const workingServer = queryResult?.workingServer;

  const filteredMovies = useMemo(() => {
    if (!iptvData || !Array.isArray(iptvData)) return [];
    
    // Si no hay búsqueda, mostramos las 200 más recientes/primeras
    if (!searchQuery) return iptvData.slice(0, 200);

    const lowerQuery = searchQuery.toLowerCase();
    
    // Filtramos sobre la lista COMPLETA que viene del servidor
    return iptvData
      .filter((m: any) => m.name && m.name.toLowerCase().includes(lowerQuery))
      .slice(0, 200); // Solo dibujamos 200 para mantener la fluidez
  }, [iptvData, searchQuery]);

  if (selectedMovie) {
    const videoUrl = getXtreamMovieUrl(workingServer, selectedMovie.stream_id, selectedMovie.container_extension);
    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-zinc-950 text-white p-4 rounded-3xl">
          <button onClick={() => setSelectedMovie(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white p-2">
            <ArrowLeft className="h-5 w-5" /> Volver
          </button>
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl">
            <VideoPlayer url={videoUrl} />
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
             <h1 className="text-3xl font-black">{selectedMovie.name}</h1>
             <div className="flex gap-4 mt-2">
               <span className="text-primary font-bold">4K ULTRA HD</span>
               <span className="text-zinc-500">Formato: {selectedMovie.container_extension}</span>
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
            <h1 className="text-5xl font-black italic">AURA <span className="text-primary not-italic">CINE</span></h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
              {iptvData ? `${iptvData.length} Títulos disponibles` : "Cargando biblioteca..."}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-96 focus-within:ring-2 focus-within:ring-primary transition-all">
            <Search className="h-5 w-5 text-white/40" />
            <input 
              placeholder="Escribe el nombre de la película..." 
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-zinc-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-zinc-500 animate-pulse font-bold uppercase tracking-tighter">Sincronizando catálogo completo...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <div className="space-y-2">
              <p className="text-xl font-bold">Error de Servidor</p>
              <p className="text-zinc-500 text-sm max-w-md">La lista es demasiado pesada o el servidor está caído temporalmente.</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
              Reintentar Conexión
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredMovies.map((movie: any) => (
              <ContentCard 
                key={movie.stream_id}
                title={movie.name}
                imageUrl={proxyImage(movie.stream_icon)}
                onClick={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Movies;