"use client";

export const cleanMovieTitleForSearch = (title: string): string => {
  if (!title) return "";

  let cleanedTitle = title
    // Elimina contenido en paréntesis y corchetes (ej: [ESPAÑOL], (2024))
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    // Elimina indicadores de calidad comunes
    .replace(/\b(4K|1080p|720p|HD|FHD|UHD|SD|HEVC|x265|x264)\b/gi, '')
    // Elimina indicadores de idioma comunes
    .replace(/\b(Latino|Castellano|Español|Spanish|English|ES|EN|SUB|Dual|Audio)\b/gi, '')
    // Elimina indicadores de fuente
    .replace(/\b(WEBDL|WEB-DL|BluRay|BRRip|DVDRip)\b/gi, '')
    // Reemplaza separadores comunes con un espacio
    .replace(/[|-]/g, ' ')
    // Elimina espacios múltiples y recorta
    .replace(/\s+/g, ' ')
    .trim();

  return cleanedTitle;
};