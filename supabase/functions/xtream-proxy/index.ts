import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lista de servidores proporcionados por el usuario
const SERVERS = [
  "http://kytv.xyz",
  "http://cdn-ky.com",
  "http://name-port.to"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    const USER = "7882659395"
    const PASS = Deno.env.get('XTREAM_PASSWORD')

    if (!PASS) {
      return new Response(JSON.stringify({ error: "XTREAM_PASSWORD no configurada" }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    let lastError = null;
    let successfulData = null;
    let workingServer = null;

    // Creamos las cabeceras para simular ser un cliente legítimo
    const requestHeaders = {
      'User-Agent': 'IPTVSmarters/1.0.0 (iPad; iPhone; iOS)',
    };

    // Intentamos con cada servidor disponible hasta que uno funcione
    for (const server of SERVERS) {
      try {
        const url = `${server}/player_api.php?username=${USER}&password=${PASS}&action=${action}`
        console.log(`[xtream-proxy] Intentando ${server} para acción: ${action} con User-Agent`)
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de espera por servidor

        const response = await fetch(url, { 
          signal: controller.signal,
          headers: requestHeaders // <-- ¡AQUÍ ESTÁ LA MAGIA!
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          successfulData = await response.json();
          workingServer = server;
          break; // ¡Éxito! Salimos del bucle
        }
      } catch (err) {
        console.warn(`[xtream-proxy] Falló servidor ${server}:`, err.message);
        lastError = err;
      }
    }

    if (!successfulData) {
      throw new Error(lastError?.message || "Ningún servidor de IPTV respondió");
    }

    return new Response(JSON.stringify({
      data: successfulData,
      credentials: {
        server: workingServer,
        user: USER,
        pass: PASS
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("[xtream-proxy] Error crítico:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})