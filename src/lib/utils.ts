import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Valida si una imagen es segura y estable para cargar en la Web (Principalmente TMDB)
 */
export function isAllowedImage(url: string | null | undefined): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Solo permitimos TMDB que es 100% compatible con HTTPS y rápido
  if (lowerUrl.includes("tmdb.org")) return true;

  // Bloqueamos IPs directas (como 185.x.x.x) y servidores de IPTV conocidos por dar problemas de CORS/HTTPS
  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipPattern.test(lowerUrl)) return false;

  // Por defecto, si no es una fuente de confianza conocida, mejor no arriesgar la red
  return false;
}

export function proxyImage(url: string | null | undefined): string {
  if (!isAllowedImage(url)) return "/placeholder.svg";
  return url!.trim();
}