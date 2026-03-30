import { useQuery, useQueries } from "@tanstack/react-query";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const SERVER_URL = "http://kytv.xyz";
const USER = "7882659395";
const PASS = "2438687584";

export const xtreamApiRequest = async (action: string) => {
  const apiUrl = `${SERVER_URL}/player_api.php?username=${USER}&password=${PASS}&action=${action}`;
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;
  
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error(`[useXtream] La respuesta de la red no fue correcta para la acción: ${action}`);
  }
  
  const textContent = await response.text();
  try {
    const data = JSON.parse(textContent);
    if (data.user_info?.auth === 0) {
      throw new Error("La autenticación de la API de Xtream falló.");
    }
    return data;
  } catch (e: any) {
    console.error("[useXtream] Fallo al analizar JSON de la respuesta del proxy:", textContent);
    throw new Error(`[useXtream] Respuesta JSON no válida para la acción: ${action}. ${e.message}`);
  }
};

export const useXtreamQuery = (action: "get_live_streams" | "get_live_categories" | "get_vod_streams" | "get_series_categories" | "get_series") => {
  return useQuery({
    queryKey: ["xtreamData", action],
    queryFn: () => xtreamApiRequest(action),
    staleTime: 1000 * 60 * 60, // 1 hora de caché
    enabled: !!action,
  });
};

export const getXtreamMovieUrl = (streamId: string | number, extension: string = 'mp4') => {
    // Como se sugirió, probamos .ts para una mejor compatibilidad sobre .mkv
    const finalExtension = extension === 'mkv' ? 'ts' : (extension || 'mp4');
    const videoUrl = `${SERVER_URL}/movie/${USER}/${PASS}/${streamId}.${finalExtension}`;
    // Todavía necesitamos el proxy para la reproducción para evitar contenido mixto y CORS
    return `${CORS_PROXY}${encodeURIComponent(videoUrl)}`;
}

export const getXtreamLiveUrl = (streamId: string | number) => {
    const videoUrl = `${SERVER_URL}/live/${USER}/${PASS}/${streamId}.m3u8`;
    return `${CORS_PROXY}${encodeURIComponent(videoUrl)}`;
}