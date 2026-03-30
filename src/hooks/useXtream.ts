import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SERVER = "http://kytv.xyz";
const USER = "7882659395";
const PASS = "2438687584";

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

// URL Directa: Es la única forma de que una película de 2 horas no se corte.
export const getXtreamMovieUrl = (server: string, id: any) => {
  return `${server}/movie/${USER}/${PASS}/${id}.mkv`;
};

export const getXtreamLiveUrl = (server: string, id: any) => {
  return `${server}/live/${USER}/${PASS}/${id}.ts`;
};