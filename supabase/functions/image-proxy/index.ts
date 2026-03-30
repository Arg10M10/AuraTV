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
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return new Response("Falta URL", { status: 400 });
    }

    // Pedimos la imagen al servidor Xtream simulando ser un reproductor
    const response = await fetch(imageUrl, {
      headers: { 'User-Agent': 'IPTVSmarters/1.0.0' }
    });

    const blob = await response.blob();
    
    return new Response(blob, {
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400'
      },
    });

  } catch (e) {
    return new Response("Error", { status: 500 });
  }
})