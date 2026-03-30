"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Film, Search, ArrowLeft, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const CORS_PROXY = "https://proxy.cors.sh/";

const Movies = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: movieData, isLoading, error } = useQuery({
    queryKey: ["xtreamMovies"],
    queryFn: async () => {
      const fetchFromProxy = async (action: string) => {
        const { data, error } = await supabase.functions.invoke('xtream-proxy', {
          body: { action }
        });
        if (error) throw error;
        return data;
      };

      const [catsRes, streamsRes] = await Promise.all([
        fetchFromProxy("get_vod_categories"),
        fetchFromProxy("get_vod_streams")
      ]);

      return { 
        categories: catsRes.data, 
        streams: streamsRes.data,
        creds: catsRes.credentials
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hora de caché para películas
  });

  const filteredMovies = useMemo(() => {
    if (!movieData?.streams) return [];
    return movieData.streams.filter((m: any) => {
      const matchesCategory = !selectedCategory || m.category_id === selectedCategory;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [movieData, selectedCategory, searchQuery]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory || !movieData?.categories) return "Todas las Categorías";
    return movieData.categories.find((c: any) => c.category_id === selectedCategory)?.category_name;
  }, [selectedCategory, movieData]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col h-96 items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium animate-pulse text-muted-foreground">Explorando biblioteca de películas familiar...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Card className="border-destructive max-w-md mx-auto mt-12 shadow-lg">
          <CardContent className="p-12 text-center">
            <Film className="h-16 w-16 mx-auto text-destructive mb-4 opacity-40" />
            <p className="text-destructive font-bold text-xl mb-2">¡Ups! Algo salió mal</p>
            <p className="text-muted-foreground">No pudimos conectar con la base de datos de películas. Por favor, reintenta más tarde.</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Si hay una película seleccionada, mostramos el reproductor a pantalla completa (dentro del layout)
  if (selectedMovie) {
    const movieUrl = `${movieData.creds.server}/movie/${movieData.creds.user}/${movieData.creds.pass}/${selectedMovie.stream_id}.${selectedMovie.container_extension || "mp4"}`;
    
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedMovie(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Volver al Catálogo
            </Button>
            <h1 className="text-2xl font-bold truncate">{selectedMovie.name}</h1>
          </div>
          <Card className="overflow-hidden bg-black aspect-video shadow-2xl">
            <VideoPlayer url={`${CORS_PROXY}${movieUrl}`} />
          </Card>
          <div className="bg-muted/30 p-6 rounded-xl border">
            <h2 className="text-xl font-bold mb-2">Información de la Película</h2>
            <p className="text-muted-foreground">Nombre: {selectedMovie.name}</p>
            {selectedMovie.rating && <p className="text-yellow-500 font-bold mt-2">⭐ {selectedMovie.rating}</p>}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <Film className="h-8 w-8 text-primary" /> Cine Familiar
            </h1>
            <p className="text-muted-foreground mt-2">Disfruta de las últimas películas de tu catálogo privado.</p>
          </div>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar películas por nombre..."
              className="pl-10 h-12 rounded-full border-2 focus:ring-primary shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 items-start">
          {/* Columna de Categorías */}
          <Card className="lg:col-span-1 shadow-md border-0 bg-muted/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                📂 Categorías
              </h3>
              <ScrollArea className="h-[60vh]">
                <div className="flex flex-col gap-1 pr-4">
                  <Button
                    variant={selectedCategory === null ? "default" : "ghost"}
                    className="justify-start font-semibold"
                    onClick={() => setSelectedCategory(null)}
                  >
                    🚀 Todas las Películas
                  </Button>
                  {movieData.categories.map((cat: any) => (
                    <Button
                      key={cat.category_id}
                      variant={selectedCategory === cat.category_id ? "default" : "ghost"}
                      className="justify-start text-sm truncate"
                      onClick={() => setSelectedCategory(cat.category_id)}
                    >
                      {cat.category_name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Grid de Películas */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-primary/20 pb-4">
              <h2 className="text-2xl font-extrabold uppercase tracking-widest text-primary flex items-center gap-3">
                {selectedCategoryName}
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                  {filteredMovies.length} Películas
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredMovies.map((movie: any) => (
                <Card
                  key={movie.stream_id}
                  className="group cursor-pointer hover:border-primary transition-all border-2 shadow-sm overflow-hidden"
                  onClick={() => setSelectedMovie(movie)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-[2/3] relative overflow-hidden bg-muted group-hover:shadow-2xl">
                      <img
                        src={movie.stream_icon || "/placeholder.svg"}
                        alt={movie.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-primary p-3 rounded-full text-white shadow-xl transform scale-0 group-hover:scale-100 transition-transform">
                          <Play className="h-8 w-8 fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-card group-hover:bg-primary/5">
                      <h3 className="text-xs font-bold line-clamp-2 uppercase tracking-tighter">
                        {movie.name}
                      </h3>
                      {movie.rating && (
                        <span className="text-[10px] text-yellow-500 font-bold mt-1 inline-block">
                          ⭐ {movie.rating}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Movies;