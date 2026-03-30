import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function proxyImage(url: string | null | undefined): string {
  // RETORNO DIRECTO: No usamos proxies para ahorrar ancho de banda de red
  if (!url) return "/placeholder.svg";
  return url.trim();
}