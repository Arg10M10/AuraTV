import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { server, action } = await req.json();
    const USER = "7882659395";
    const PASS = "2438687584";

    // El servidor kytv.xyz requiere este User-Agent específico para no dar 403
    const apiUrl = `${server}/player_api.php?username=${USER}&password=${PASS}&action=${action}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'IPTVSmarters/1.0.0', // Identidad obligatoria
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})