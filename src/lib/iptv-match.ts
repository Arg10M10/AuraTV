"use client";

/**
 * Limpia un string para comparaciones (quita tildes, puntuación y pasa a minúsculas)
 */
const cleanString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quita tildes
    .replace(/[^a-z0-9]/g, ""); // Quita espacios y puntuación
};

/**
 * Busca la mejor coincidencia entre un título de TMDB y la lista de Xtream.
 */
export const findBestIptvMatch = (tmdbTitle: string, releaseDate: string, iptvStreams: any[]) => {
  if (!iptvStreams || !tmdbTitle) return null;
  
  const cleanTmdbTitle = cleanString(tmdbTitle);
  const year = releaseDate ? releaseDate.substring(0, 4) : "";
  
  // 1. Intento: Coincidencia exacta (ignorando formato)
  let match = iptvStreams.find(s => cleanString(s.name) === cleanTmdbTitle);
  
  // 2. Intento: Coincidencia exacta incluyendo el año en el nombre de IPTV (ej: "Avatar 2009")
  if (!match && year) {
    match = iptvStreams.find(s => cleanString(s.name) === `${cleanTmdbTitle}${year}`);
  }
  
  // 3. Intento: El nombre de IPTV contiene el título de TMDB
  if (!match) {
    match = iptvStreams.find(s => 
      cleanString(s.name).includes(cleanTmdbTitle) || 
      cleanTmdbTitle.includes(cleanString(s.name))
    );
  }
  
  return match;
};