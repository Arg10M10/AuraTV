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

    if (!server || !action) {
      throw new Error("Faltan los parámetros 'server' o 'action'.");
    }

    const apiUrl = `${server}/player_api.php?username=${USER}&password=${PASS}&action=${action}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'IPTVSmarters/1.0.0 (iPad; iPhone; iOS)'
      }
    });

    if (!response.ok) {
      throw new Error(`Respuesta no OK (${response.status}) del servidor Xtream: ${server}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("[xtream-proxy] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})