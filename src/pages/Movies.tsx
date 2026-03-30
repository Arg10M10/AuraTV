"use client";

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, ArrowLeft, AlertCircle } from "lucide-react";
import { useXtreamQuery, getXtreamMovieUrl } from "@/hooks/useXtream";
import { Button } from "@/components/ui/button";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const { data: queryResult, isLoading: isLoadingList, error, refetch } = useXtreamQuery("get_vod_streams");

  const iptvData = queryResult?.data;
  const workingServer = queryResult?.workingServer;

  const filteredMovies = useMemo(() => {
    if (!iptvData || !Array.isArray(iptvData)) return [];
    const baseList = searchQuery 
      ? iptvData.filter((m: any) => m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : iptvData;
    return baseList.slice(0, 24); // Aumentamos un poco para llenar filas pero mantenemos límite
  }, [iptvData, searchQuery]);

  // VISTA DE REPRODUCCIÓN (Aislada 100%)
  if (selectedMovie) {
    const videoUrl = getXtreamMovieUrl(workingServer, selectedMovie.stream_id);

    return (
      <Layout>
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="p-4 bg-zinc-950 flex items-center justify-between border-b border-white/5">
            <button 
              onClick={() => setSelectedMovie(null)} 
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al catálogo
            </button>
            <span className="text-[10px] text-zinc-700 font-black uppercase tracking-tighter">
              Aura Cinema Engine v2
            </span>
          </div>
          
          <div className="flex-grow relative bg-black">
            <VideoPlayer url={videoUrl} />
          </div>

          <div className="p-6 bg-zinc-950">
             <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">{selectedMovie.name}</h1>
             <p className="text-zinc-600 text-[10px] font-bold mt-1">STREAMING DIRECTO POR HTTP (OPTIMIZADO)</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 bg-zinc-950 text-white p-6 rounded-3xl min-h-screen border border-white/5">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic tracking-tighter">AURA <span className="text-primary not-italic">CINE</span></h1>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
              Red Filtrada: Solo TMDB permitido
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-80">
            <Search className="h-4 w-4 text-white/20" />
            <input 
              placeholder="Buscar película..." 
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-zinc-700 font-bold text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-zinc-700 font-black uppercase tracking-widest text-[9px]">Sincronizando biblioteca segura...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive/30" />
            <Button onClick={() => refetch()} variant="ghost" className="text-zinc-500 hover:text-white uppercase font-black text-xs tracking-widest">
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredMovies.map((movie: any) => (
              <ContentCard 
                key={movie.stream_id}
                title={movie.name}
                imageUrl={movie.stream_icon}
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