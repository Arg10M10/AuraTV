"use client";

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import ContentCard from "@/components/ContentCard";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { useXtreamQuery } from "@/hooks/useXtream";
import { proxyImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Series = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: queryResult, isLoading, error, refetch } = useXtreamQuery("get_series");

  const seriesData = queryResult?.data;

  const filteredSeries = useMemo(() => {
    if (!seriesData || !Array.isArray(seriesData)) return [];
    if (!searchQuery) return seriesData.slice(0, 100);

    const lowerQuery = searchQuery.toLowerCase();
    return seriesData
      .filter((s: any) => s.name && s.name.toLowerCase().includes(lowerQuery))
      .slice(0, 100);
  }, [seriesData, searchQuery]);

  return (
    <Layout>
      <div className="space-y-12 bg-zinc-950 text-white p-8 rounded-3xl min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black italic text-primary">SERIES</h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
              {seriesData ? `${seriesData.length} Temporadas completas` : "Cargando catálogo..."}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-96">
            <Search className="h-5 w-5 text-white/40" />
            <input 
              placeholder="Buscar serie..." 
              className="bg-transparent border-none outline-none text-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-zinc-500 font-bold uppercase text-xs">Sincronizando Series...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <p className="text-xl font-bold">Error al cargar series</p>
            <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredSeries.map((s: any) => (
              <ContentCard 
                key={s.series_id}
                title={s.name}
                imageUrl={proxyImage(s.series_icon || s.cover)}
                onClick={() => console.log("Serie seleccionada:", s.series_id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Series;