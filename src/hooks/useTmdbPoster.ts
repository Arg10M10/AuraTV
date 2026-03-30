import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cleanMovieTitleForSearch } from "@/lib/title-cleaner";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const useTmdbPoster = (title: string) => {
  // Limpiamos el título antes de hacer cualquier cosa
  const cleanedTitle = cleanMovieTitleForSearch(title);

  const { data: posterUrl, isLoading } = useQuery({
    // Usamos el título limpio como clave para evitar errores de caché
    queryKey: ["tmdbPoster", cleanedTitle],
    queryFn: async () => {
      if (!cleanedTitle) return "/placeholder.svg";

      const searchTypes = ["movie", "tv"];
      
      for (const type of searchTypes) {
        try {
          // Buscamos en TMDB con el título limpio
          const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
            body: { endpoint: `/search/${type}`, query: cleanedTitle }
          });

          if (error) continue;

          if (data?.results && data.results.length > 0 && data.results[0].poster_path) {
            return `${TMDB_IMAGE_BASE_URL}${data.results[0].poster_path}`;
          }
        } catch (e) {
          console.warn(`[TMDB] Error fetching poster for type ${type}:`, e);
          continue;
        }
      }
      
      return "/placeholder.svg"; // Fallback si no se encuentra nada
    },
    enabled: !!cleanedTitle, // Solo se ejecuta si hay un título limpio
    staleTime: Infinity, // Los pósters no cambian, cachear indefinidamente
  });

  return { posterUrl: posterUrl || "/placeholder.svg", isLoadingPoster: isLoading };
};