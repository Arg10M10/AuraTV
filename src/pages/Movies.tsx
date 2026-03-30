"use client";

import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, AlertCircle } from "lucide-react";
import { useXtreamQuery, getXtreamMovieUrl } from "@/hooks/useXtream";
import { Button } from "@/components/ui/button";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  // Cargamos los datos pero con un cache agresivo para evitar peticiones en segundo plano
  const { data: queryResult, isLoading: isLoadingList, error, refetch } = useXtreamQuery("get_vod_streams");

  const iptvData = queryResult?.data;
  const workingServer = queryResult?.workingServer;

  const filteredMovies = useMemo(() => {
    if (!iptvData || !Array.isArray(iptvData)) return [];
    
    const baseList = searchQuery 
      ? iptvData.filter((m: any) => m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : iptvData;

    // LIMITACIÓN CRÍTICA: Solo 20 para no colapsar el DOM ni la red
    return baseList.slice(0, 20);
  }, [iptvData, searchQuery]);

  // Si hay una película seleccionada, ocultamos el catálogo para liberar memoria y red
  if (selectedMovie) {
    const videoUrl = getXtreamMovieUrl(workingServer, selectedMovie.stream_id);

    return (
      <Layout>
        <div className="space-y-6 min-h-screen bg-black text-white p-4 rounded-3xl animate-in fade-in duration-500">
          <button 
            onClick={() => setSelectedMovie(null)} 
            className="flex items-center gap-2 text-zinc-500 hover:text-white p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Salir de Reproducción
          </button>
          
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
            <VideoPlayer url={videoUrl} />
          </div>

          <div className="p-8 bg-zinc-900/50 rounded-3xl border border-white/5">
             <h1 className="text-4xl font-black tracking-tighter italic uppercase">{selectedMovie.name}</h1>
             <div className="flex gap-4 mt-4">
               <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                 Streaming Directo
               </span>
               <p className="text-zinc-500 text-sm font-medium">Prioridad de red: Máxima</p>
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
            <h1 className="text-5xl font-black italic tracking-tighter">AURA <span className="text-primary not-italic">CINE</span></h1>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Biblioteca Optimizada (Top 20)
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-96 focus-within:ring-2 focus-within:ring-primary transition-all">
            <Search className="h-5 w-5 text-white/20" />
            <input 
              placeholder="Escribe para filtrar..." 
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-zinc-700 font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Sincronizando Servidor...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive/50" />
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl border-white/10">
              Reintentar Conexión
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {filteredMovies.map((movie: any) => (
              <ContentCard 
                key={movie.stream_id}
                title={movie.name}
                imageUrl={movie.stream_icon} // URL Directa sin proxy
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