import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lista de servidores para obtener los DATOS
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
    const PASS = "2438687584" // Usando la contraseña real proporcionada

    let lastError = null;
    let successfulData = null;
    let workingServer = null;

    const requestHeaders = {
      'User-Agent': 'IPTVSmarters/1.0.0 (iPad; iPhone; iOS)',
    };

    for (const server of SERVERS) {
      try {
        const url = `${server}/player_api.php?username=${USER}&password=${PASS}&action=${action}`
        console.log(`[xtream-proxy] Intentando ${server} para acción: ${action} con User-Agent`)
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, { 
          signal: controller.signal,
          headers: requestHeaders
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          successfulData = await response.json();
          workingServer = server;
          break;
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