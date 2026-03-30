import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Expose-Headers': 'content-type, content-length, accept-ranges, content-range',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get('url');

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "El parámetro 'url' es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const range = req.headers.get('Range');
    const headers = new Headers({
      'User-Agent': 'IPTVSmarters/1.0.0 (iPad; iPhone; iOS)',
    });
    
    if (range) {
      headers.set('Range', range);
    }

    const response = await fetch(videoUrl, { 
      headers,
      redirect: 'follow'
    });

    // Clonamos las cabeceras de CORS y añadimos las del servidor original
    const responseHeaders = new Headers(corsHeaders);
    
    // Forward essential headers from the origin server
    const headersToForward = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
    response.headers.forEach((value, key) => {
      if (headersToForward.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    // Si el servidor no devuelve content-type, intentamos inferirlo o poner uno genérico
    if (!responseHeaders.has('content-type')) {
      if (videoUrl.includes('.m3u8')) {
        responseHeaders.set('content-type', 'application/x-mpegURL');
      } else {
        responseHeaders.set('content-type', 'video/mp4');
      }
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("[video-proxy] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})