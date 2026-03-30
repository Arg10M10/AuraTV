import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function proxyImage(url: string | null | undefined): string {
  if (!url) {
    return "/placeholder.svg";
  }

  // Si la URL ya es HTTPS y no necesita proxy, la dejamos tal cual
  if (url.startsWith('https://')) {
    return url;
  }

  // Limpiamos la URL de espacios
  const cleanUrl = url.trim();
  
  // Si empieza con http://, le quitamos el protocolo para el proxy weserv.nl
  let sourceUrl = cleanUrl;
  if (cleanUrl.startsWith('http://')) {
    sourceUrl = cleanUrl.substring(7);
  }

  // Usamos weserv.nl que es muy fiable para saltar bloqueos de contenido mixto
  return `https://images.weserv.nl/?url=${encodeURIComponent(sourceUrl)}&default=https://via.placeholder.com/400x600?text=No+Image&errorredirect=https://via.placeholder.com/400x600?text=Error`;
}