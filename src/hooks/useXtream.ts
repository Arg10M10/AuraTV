import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SERVERS = [
  "http://kytv.xyz",
  "http://cdn-ky.com",
  "http://name-port.to"
];
const USER = "7882659395";
const PASS = "2438687584";

export const xtreamApiRequest = async (action: string) => {
  let lastError: Error | null = null;

  for (const server of SERVERS) {
    try {
      const { data, error } = await supabase.functions.invoke('xtream-proxy', {
        body: { server, action },
      });

      if (error) throw error;
      
      if (data.user_info?.auth === 0) {
        throw new Error(`Autenticación fallida en el servidor: ${server}`);
      }

      return { data, workingServer: server };

    } catch (error: any) {
      console.warn(`[useXtream] Falló el servidor ${server} para la acción ${action}:`, error.message);
      lastError = error;
    }
  }

  throw new Error(lastError?.message || `[useXtream] Todos los servidores fallaron para la acción: ${action}`);
};

export const useXtreamQuery = (action: "get_live_streams" | "get_live_categories" | "get_vod_streams" | "get_series_categories" | "get_series") => {
  return useQuery({
    queryKey: ["xtreamData", action],
    queryFn: () => xtreamApiRequest(action),
    staleTime: 1000 * 60 * 60,
    enabled: !!action,
  });
};

export const getXtreamMovieUrl = (serverUrl: string, streamId: string | number, extension: string = 'mp4') => {
    if (!serverUrl) return "";
    // URL DIRECTA para App Nativa (Android maneja el tráfico cleartext con el config.xml)
    return `${serverUrl}/movie/${USER}/${PASS}/${streamId}.${extension}`;
}

export const getXtreamLiveUrl = (serverUrl: string, streamId: string | number) => {
    if (!serverUrl) return "";
    // URL DIRECTA para App Nativa
    return `${serverUrl}/live/${USER}/${PASS}/${streamId}.ts`;
}