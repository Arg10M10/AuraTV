import { useQuery } from "@tanstack/react-query";

const SERVER = "http://kytv.xyz";
const USER = "7882659395";
const PASS = "2438687584";

export const xtreamApiRequest = async (action: string) => {
  // En Electron llamamos directo porque no hay restricciones CORS ni 403 (gracias a main.ts)
  const response = await fetch(`${SERVER}/player_api.php?username=${USER}&password=${PASS}&action=${action}`);
  const data = await response.json();
  return { data, workingServer: SERVER };
};

export const useXtreamQuery = (action: string) => {
  return useQuery({
    queryKey: ["xtreamData", action],
    queryFn: () => xtreamApiRequest(action),
    staleTime: 1000 * 60 * 60,
  });
};

export const getXtreamMovieUrl = (server: string, id: any) => `${server}/movie/${USER}/${PASS}/${id}.mkv`;
export const getXtreamLiveUrl = (server: string, id: any) => `${server}/live/${USER}/${PASS}/${id}.ts`;