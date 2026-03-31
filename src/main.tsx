import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Confirmación de arranque en consola
console.log("[AuraTV] Renderizando aplicación...");

document.documentElement.classList.add('dark');

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("[AuraTV] Error crítico: No se encontró el elemento #root");
}