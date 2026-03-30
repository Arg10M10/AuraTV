import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SERVERS = [
  "http://kytv.xyz", // Mantenemos HTTP explícito
  "http://cdn-ky.com"
];
const USER = "7882659395";
const PASS = "2438687584";

export const xtreamApiRequest = async (action: string) => {
  let lastError: string = "";

  for (const server of SERVERS) {
    try {
      const { data, error } = await supabase.functions.invoke('xtream-proxy', {
        body: { server, action },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      
      return { data, workingServer: server };

    } catch (err: any) {
      lastError = err.message;
    }
  }

  throw new Error(lastError || "Error de conexión con el servicio de video.");
};

export const useXtreamQuery = (action: string) => {
  return useQuery({
    queryKey: ["xtreamData", action],
    queryFn: () => xtreamApiRequest(action),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
};

export const getXtreamMovieUrl = (serverUrl: string, streamId: string | number) => {
    if (!serverUrl) return "";
    // Aseguramos que la URL del video sea HTTP para el APK
    const cleanServer = serverUrl.replace("https://", "http://");
    return `${cleanServer}/movie/${USER}/${PASS}/${streamId}.mkv`;
}

export const getXtreamLiveUrl = (serverUrl: string, streamId: string | number) => {
    if (!serverUrl) return "";
    const cleanServer = serverUrl.replace("https://", "http://");
    return `${cleanServer}/live/${USER}/${PASS}/${streamId}.ts`;
}