import { useQuery } from "@tanstack/react-query";

const SERVER = "http://kytv.xyz";
const USER = "7882659395";
const PASS = "2438687584";
const SUPABASE_PROJECT_URL = "https://vspullgchtzqgdclqjaw.supabase.co";

export const xtreamApiRequest = async (action: string) => {
  // Verificamos si estamos en Electron (donde no hay CORS) o en el Navegador
  const isElectron = (window as any).electronAPI !== undefined;

  if (isElectron) {
    const response = await fetch(`${SERVER}/player_api.php?username=${USER}&password=${PASS}&action=${action}`);
    const data = await response.json();
    return { data, workingServer: SERVER };
  } else {
    // En el navegador usamos el proxy de Supabase para evitar errores CORS
    const response = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/xtream-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server: SERVER, action })
    });
    
    if (!response.ok) throw new Error("Error en el proxy de red");
    
    const data = await response.json();
    return { data, workingServer: SERVER };
  }
};

export const useXtreamQuery = (action: string) => {
  return useQuery({
    queryKey: ["xtreamData", action],
    queryFn: () => xtreamApiRequest(action),
    staleTime: 1000 * 60 * 60,
    retry: 1
  });
};

export const getXtreamMovieUrl = (server: string, id: any) => `${server}/movie/${USER}/${PASS}/${id}.mkv`;
export const getXtreamLiveUrl = (server: string, id: any) => `${server}/live/${USER}/${PASS}/${id}.ts`;