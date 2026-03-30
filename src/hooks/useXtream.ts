import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SERVERS = [
  "http://kytv.xyz",
  "http://cdn-ky.com"
];
const USER = "7882659395";
const PASS = "2438687584";

export const xtreamApiRequest = async (action: string) => {
  let lastError: string = "";

  for (const server of SERVERS) {
    try {
      console.log(`[useXtream] Intentando conectar con: ${server}...`);
      const { data, error } = await supabase.functions.invoke('xtream-proxy', {
        body: { server, action },
      });

      if (error) throw new Error(error.message || "Error en la función Edge");
      if (data?.error) throw new Error(data.error);
      
      console.log(`[useXtream] ¡Conexión exitosa con ${server}!`);
      return { data, workingServer: server };

    } catch (err: any) {
      console.warn(`[useXtream] Servidor ${server} falló:`, err.message);
      lastError = err.message;
    }
  }

  throw new Error(lastError || "No se pudo conectar con ningún servidor de video.");
};

export const useXtreamQuery = (action: string) => {
  return useQuery({
    queryKey: ["xtreamData", action],
    queryFn: () => xtreamApiRequest(action),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
};

/**
 * Genera la URL directa del video forzando SIEMPRE .mkv para máxima calidad
 */
export const getXtreamMovieUrl = (serverUrl: string, streamId: string | number) => {
    if (!serverUrl) return "";
    // Ignoramos cualquier otra extensión y forzamos .mkv original
    return `${serverUrl}/movie/${USER}/${PASS}/${streamId}.mkv`;
}

export const getXtreamLiveUrl = (serverUrl: string, streamId: string | number) => {
    if (!serverUrl) return "";
    return `${serverUrl}/live/${USER}/${PASS}/${streamId}.ts`;
}