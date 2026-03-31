import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

console.log("[AuraTV] Iniciando motor de renderizado...");

// Forzamos modo oscuro en el root
document.documentElement.classList.add('dark');

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("[AuraTV] App montada con éxito");
} else {
  console.error("[AuraTV] Error: No se encontró el elemento #root");
}