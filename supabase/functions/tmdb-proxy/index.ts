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
    const { endpoint, query } = await req.json()
    const TMDB_API = Deno.env.get('TMDB_API')

    if (!TMDB_API) {
      throw new Error("TMDB_API no configurada en los secretos de Supabase");
    }

    const baseUrl = "https://api.themoviedb.org/3";
    const url = query 
      ? `${baseUrl}${endpoint}?api_key=${TMDB_API}&language=es-ES&query=${encodeURIComponent(query)}`
      : `${baseUrl}${endpoint}?api_key=${TMDB_API}&language=es-ES&page=1`;

    const response = await fetch(url);
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