"use client";

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, Film } from "lucide-react";
import { useXtreamQuery, getXtreamMovieUrl } from "@/hooks/useXtream";
import { proxyImage } from "@/lib/utils";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const { data: queryResult, isLoading: isLoadingList, error } = useXtreamQuery("get_vod_streams");

  const iptvData = queryResult?.data;
  const workingServer = queryResult?.workingServer;

  const filteredMovies = useMemo(() => {
    if (!iptvData || !Array.isArray(iptvData)) return [];
    if (!searchQuery) return iptvData.slice(0, 150);
    const lowerQuery = searchQuery.toLowerCase();
    return iptvData
      .filter((m: any) => m.name?.toLowerCase().includes(lowerQuery))
      .slice(0, 150);
  }, [iptvData, searchQuery]);

  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
  };
  
  const handleGoBack = () => {
    setSelectedMovie(null);
  }

  if (selectedMovie) {
    const videoUrl = getXtreamMovieUrl(workingServer, selectedMovie.stream_id, selectedMovie.container_extension);
    
    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-zinc-950 text-white p-4 rounded-3xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleGoBack}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2"
            >
              <ArrowLeft className="h-5 w-5" /> Volver al Catálogo
            </button>
          </div>
          
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5">
            <VideoPlayer 
              url={videoUrl} 
              serverName={workingServer ? new URL(workingServer).hostname : "Servidor Directo"}
            />
          </div>

          <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
            {selectedMovie.stream_icon ? (
              <img 
                src={proxyImage(selectedMovie.stream_icon)} 
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
                <span className="text-primary font-bold">Servidor Premium ({workingServer ? new URL(workingServer).hostname : 'Directo'})</span>
              </div>
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
              {iptvData ? `${iptvData.length} películas disponibles` : 'Cargando catálogo...'}
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
          
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-zinc-500 animate-pulse">Sincronizando con servidores de video...</p>
            </div>
          ) : error ? (
             <div className="py-20 text-center text-red-400">
              <p>Error al cargar el catálogo de películas.</p>
              <p className="text-sm text-zinc-500">{(error as Error).message}</p>
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredMovies.map((movie: any) => (
                <ContentCard 
                  key={movie.stream_id}
                  title={movie.name}
                  imageUrl={proxyImage(movie.stream_icon)}
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