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
    const { action, stream_id, container_extension } = await req.json()
    const USER = "7882659395"
    const PASS = "2438687584"

    const requestHeaders = {
      'User-Agent': 'IPTVSmarters/1.0.0 (iPad; iPhone; iOS)',
    };

    // Nueva acción para resolver la URL de VOD
    if (action === 'get_vod_url') {
      if (!stream_id) throw new Error("Se requiere stream_id para get_vod_url");

      const extension = container_extension || 'mp4';
      const initialUrl = `${SERVERS[0]}/movie/${USER}/${PASS}/${stream_id}.${extension}`;
      console.log(`[xtream-proxy] Resolviendo URL: ${initialUrl}`);

      const response = await fetch(initialUrl, {
        method: 'HEAD', // Usamos HEAD para no descargar el video, solo las cabeceras
        redirect: 'manual', // ¡Clave! No seguimos la redirección automáticamente
        headers: requestHeaders,
      });

      // La URL final está en la cabecera 'location' de la respuesta de redirección
      const finalUrl = response.headers.get('location');
      if (!finalUrl) {
        console.error(`[xtream-proxy] No se pudo redirigir desde ${initialUrl}. Estado: ${response.status}`);
        throw new Error(`El servidor no redirigió para la URL inicial. Estado: ${response.status}`);
      }
      
      console.log(`[xtream-proxy] URL final resuelta: ${finalUrl}`);
      return new Response(JSON.stringify({ finalUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Lógica existente para obtener listas
    let lastError = null;
    let successfulData = null;
    let workingServer = null;

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