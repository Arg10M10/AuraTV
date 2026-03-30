import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * proxyImage: Detecta si la imagen es HTTP (insegura) y la pasa por nuestro
 * túnel de Supabase para que cargue sin bloqueos en la web y Android.
 */
export function proxyImage(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // Si ya es HTTPS (como las de TMDB o algunos servidores modernos), la dejamos pasar directo
  if (url.startsWith('https://')) {
    return url;
  }

  // Si es HTTP (insegura), la mandamos por el proxy de Supabase
  const projectUrl = "https://vspullgchtzqgdclqjaw.supabase.co";
  return `${projectUrl}/functions/v1/image-proxy?url=${encodeURIComponent(url)}`;
}