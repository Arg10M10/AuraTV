import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const USER = "7882659395";
const PASS = "2438687584";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { server, action } = await req.json();
    console.log(`[xtream-proxy] Solicitando ${action} a ${server}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Aumentamos a 30s para listas masivas

    const apiUrl = `${server}/player_api.php?username=${USER}&password=${PASS}&action=${action}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Servidor IPTV respondió con status: ${response.status}`);
    }

    const data = await response.json();
    
    // IMPORTANTE: Ya no cortamos la lista. Enviamos todo el catálogo.
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[xtream-proxy] Error:", error.message);
    return new Response(JSON.stringify({ 
      error: error.name === 'AbortError' ? "La lista es demasiado grande para el tiempo de espera del servidor" : error.message 
    }), {
      status: error.name === 'AbortError' ? 504 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})