import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function proxyImage(url: string | null | undefined): string {
  if (!url) {
    return "/placeholder.svg";
  }
  // Usamos un proxy de imágenes fiable para evitar problemas de contenido mixto (http en https).
  if (url.startsWith('http://')) {
    // weserv.nl requiere la URL sin el protocolo.
    return `https://images.weserv.nl/?url=${url.substring(7)}&default=/placeholder.svg&w=400`;
  }
  return url;
}