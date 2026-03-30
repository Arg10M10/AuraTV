import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Filtro de imágenes: Solo permite posters de TMDB.
 * Bloquea IPs directas y URLs lentas de proveedores para liberar ancho de banda.
 */
export function getCleanPoster(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // Solo aceptamos imágenes de TMDB (son las más rápidas y seguras)
  if (url.includes('image.tmdb.org')) {
    return url;
  }

  // Detectamos si es una IP directa (ej: http://185.x.x.x/...)
  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipPattern.test(url)) {
    return "/placeholder.svg"; // Bloqueo preventivo
  }

  // Por defecto, si no es TMDB, preferimos no cargarla para no saturar el log
  return "/placeholder.svg";
}