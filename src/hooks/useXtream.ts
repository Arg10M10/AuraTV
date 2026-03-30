import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SERVER = "http://kytv.xyz";
const USER = "7882659395";
const PASS = "2438687584";
const PROJECT_ID = "vspullgchtzqgdclqjaw";

export const xtreamApiRequest = async (action: string) => {
  const { data, error } = await supabase.functions.invoke('xtream-proxy', {
    body: { server: SERVER, action },
  });
  if (error || data?.error) throw new Error(error?.message || data?.error);
  return { data, workingServer: SERVER };
};

export const useXtreamQuery = (action: string) => {
  return useQuery({
    queryKey: ["xtreamData", action],
    queryFn: () => xtreamApiRequest(action),
    staleTime: 1000 * 60 * 60,
    retry: 2
  });
};

/**
 * getProxiedVideoUrl: Envía el video a través de un túnel HTTPS para evitar
 * bloqueos de "Contenido Mixto" en la web y en el APK.
 */
export const getProxiedVideoUrl = (directUrl: string) => {
  // Usamos la URL completa de la función de Supabase
  return `https://${PROJECT_ID}.supabase.co/functions/v1/video-proxy?url=${encodeURIComponent(directUrl)}`;
};

export const getXtreamMovieUrl = (server: string, id: any) => {
  const directUrl = `${server}/movie/${USER}/${PASS}/${id}.mkv`;
  return getProxiedVideoUrl(directUrl);
};

export const getXtreamLiveUrl = (server: string, id: any) => {
  const directUrl = `${server}/live/${USER}/${PASS}/${id}.ts`;
  return getProxiedVideoUrl(directUrl);
};