import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * proxyImage: Ahora permite cargar cualquier URL proveniente de Xtream Code.
 * Se mantiene el placeholder para cuando no hay icono definido.
 */
export function proxyImage(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // Eliminamos todas las restricciones previas para que carguen los iconos del servidor
  return url;
}