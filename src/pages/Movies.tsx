"use client";

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import ContentCard from "@/components/ContentCard";
import VideoPlayer from "@/components/VideoPlayer";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { useXtreamQuery, getXtreamMovieUrl } from "@/hooks/useXtream";
import { proxyImage } from "@/lib/utils";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovieUrl, setSelectedMovieUrl] = useState<string | null>(null);
  const { data: queryResult, isLoading, error } = useXtreamQuery("get_vod_streams");

  const iptvData = queryResult?.data;
  const workingServer = queryResult?.workingServer;

  const filteredMovies = useMemo(() => {
    if (!iptvData || !Array.isArray(iptvData)) return [];
    if (!searchQuery) return iptvData.slice(0, 48);

    const lowerQuery = searchQuery.toLowerCase();
    return iptvData
      .filter((m: any) => m.name && m.name.toLowerCase().includes(lowerQuery))
      .slice(0, 48);
  }, [iptvData, searchQuery]);

  return (
    <Layout>
      <div className="space-y-12">
        <header className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h1 className="text-6xl font-black italic tracking-tighter">CINE</h1>
            <p className="text-primary font-bold uppercase tracking-widest text-[10px]">
              {iptvData ? `${iptvData.length} Títulos en 4K` : "Sincronizando..."}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-96 focus-within:ring-2 ring-primary transition-all">
            <Search className="h-5 w-5 text-zinc-500" />
            <input 
              placeholder="¿Qué quieres ver hoy?" 
              className="bg-transparent border-none outline-none text-white w-full font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-40 text-destructive font-bold flex flex-col items-center gap-4">
             <AlertCircle className="h-12 w-12" />
             Error al conectar con kytv.xyz
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {filteredMovies.map((movie: any) => (
              <ContentCard 
                key={movie.stream_id}
                title={movie.name}
                imageUrl={proxyImage(movie.stream_icon)}
                onClick={() => setSelectedMovieUrl(getXtreamMovieUrl(workingServer, movie.stream_id))}
              />
            ))}
          </div>
        )}

        {selectedMovieUrl && (
          <VideoPlayer 
            url={selectedMovieUrl} 
            onClose={() => setSelectedMovieUrl(null)} 
          />
        )}
      </div>
    </Layout>
  );
};

export default Movies;