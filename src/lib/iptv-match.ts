"use client";

/**
 * Busca la mejor coincidencia entre un título de TMDB y la lista de Xtream.
 */
export const findBestIptvMatch = (tmdbTitle: string, iptvStreams: any[]) => {
  if (!iptvStreams || !tmdbTitle) return null;
  
  const cleanTitle = tmdbTitle.toLowerCase().trim();
  
  // 1. Intento: Coincidencia exacta
  let match = iptvStreams.find(s => s.name.toLowerCase().trim() === cleanTitle);
  
  // 2. Intento: El nombre de IPTV contiene el título de TMDB (o viceversa)
  if (!match) {
    match = iptvStreams.find(s => 
      s.name.toLowerCase().includes(cleanTitle) || 
      cleanTitle.includes(s.name.toLowerCase())
    );
  }
  
  return match;
};