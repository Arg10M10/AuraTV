import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const useTmdbPoster = (title: string) => {
  const { data: posterUrl, isLoading } = useQuery({
    queryKey: ["tmdbPoster", title],
    queryFn: async () => {
      if (!title) return "/placeholder.svg";

      const searchTypes = ["movie", "tv"];
      
      for (const type of searchTypes) {
        try {
          const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
            body: { endpoint: `/search/${type}`, query: title }
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
    enabled: !!title,
    staleTime: Infinity, // Los pósters no cambian, cachear indefinidamente
  });

  return { posterUrl: posterUrl || "/placeholder.svg", isLoadingPoster: isLoading };
};