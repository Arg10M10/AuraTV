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
      return new Response(JSON.stringify({ error: "URL requerida" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const range = req.headers.get('Range');
    const headers = new Headers({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    });
    
    if (range) {
      headers.set('Range', range);
    }

    const response = await fetch(videoUrl, { 
      headers,
      redirect: 'follow'
    });

    const responseHeaders = new Headers(corsHeaders);
    
    // Pasamos todas las cabeceras del servidor original para máxima compatibilidad
    response.headers.forEach((value, key) => {
      if (['content-type', 'content-length', 'accept-ranges', 'content-range'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    // Si el servidor no envía content-type, ponemos uno genérico de video
    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'video/mp4');
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