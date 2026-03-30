"use client";

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, AlertCircle, PlayCircle } from "lucide-react";
import { useXtreamQuery, getXtreamMovieUrl } from "@/hooks/useXtream";
import { proxyImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { playNatively } from "@/lib/native-player";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: queryResult, isLoading, error, refetch } = useXtreamQuery("get_vod_streams");

  const iptvData = queryResult?.data;
  const workingServer = queryResult?.workingServer;

  const filteredMovies = useMemo(() => {
    if (!iptvData || !Array.isArray(iptvData)) return [];
    if (!searchQuery) return iptvData.slice(0, 100);

    const lowerQuery = searchQuery.toLowerCase();
    return iptvData
      .filter((m: any) => m.name && m.name.toLowerCase().includes(lowerQuery))
      .slice(0, 100);
  }, [iptvData, searchQuery]);

  const handlePlay = (movie: any) => {
    const videoUrl = getXtreamMovieUrl(workingServer, movie.stream_id);
    const poster = proxyImage(movie.stream_icon);
    playNatively(videoUrl, movie.name, poster);
  };

  return (
    <Layout>
      <div className="space-y-12 bg-zinc-950 text-white p-8 rounded-3xl min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black italic">AURA <span className="text-primary not-italic">CINE</span></h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
              {iptvData ? `${iptvData.length} Títulos disponibles` : "Conectando..."}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-96">
            <Search className="h-5 w-5 text-white/40" />
            <input 
              placeholder="Buscar título..." 
              className="bg-transparent border-none outline-none text-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-zinc-500 font-bold uppercase text-xs">Cargando catálogo nativo...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredMovies.map((movie: any) => (
              <ContentCard 
                key={movie.stream_id}
                title={movie.name}
                imageUrl={proxyImage(movie.stream_icon)}
                onClick={() => handlePlay(movie)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Movies;