import { useQuery, useQueries } from "@tanstack/react-query";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
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
      const apiUrl = `${server}/player_api.php?username=${USER}&password=${PASS}&action=${action}`;
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Respuesta no OK (${response.status}) del servidor: ${server}`);
      }
      
      const textContent = await response.text();
      const data = JSON.parse(textContent);

      if (data.user_info?.auth === 0) {
        throw new Error(`Autenticación fallida en el servidor: ${server}`);
      }

      // Success! Return data and the working server
      return { data, workingServer: server };

    } catch (error: any) {
      console.warn(`[useXtream] Falló el servidor ${server} para la acción ${action}:`, error.message);
      lastError = error;
    }
  }

  // If the loop completes without returning, all servers failed.
  throw new Error(lastError?.message || `[useXtream] Todos los servidores fallaron para la acción: ${action}`);
};

export const useXtreamQuery = (action: "get_live_streams" | "get_live_categories" | "get_vod_streams" | "get_series_categories" | "get_series") => {
  return useQuery({
    queryKey: ["xtreamData", action],
    queryFn: () => xtreamApiRequest(action),
    staleTime: 1000 * 60 * 60, // 1 hora de caché
    enabled: !!action,
  });
};

export const getXtreamMovieUrl = (serverUrl: string, streamId: string | number, extension: string = 'mp4') => {
    if (!serverUrl) return "";
    const finalExtension = extension === 'mkv' ? 'ts' : (extension || 'mp4');
    const videoUrl = `${serverUrl}/movie/${USER}/${PASS}/${streamId}.${finalExtension}`;
    return `${CORS_PROXY}${encodeURIComponent(videoUrl)}`;
}

export const getXtreamLiveUrl = (serverUrl: string, streamId: string | number) => {
    if (!serverUrl) return "";
    const videoUrl = `${serverUrl}/live/${USER}/${PASS}/${streamId}.m3u8`;
    return `${CORS_PROXY}${encodeURIComponent(videoUrl)}`;
}