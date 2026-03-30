import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
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

    const response = await fetch(videoUrl, { headers });

    if (!response.ok && response.status !== 206) { // 206 is Partial Content, which is OK
      const errorText = await response.text();
      throw new Error(`Respuesta no OK (${response.status}) del servidor de video: ${errorText}`);
    }

    const responseHeaders = new Headers(corsHeaders);
    response.headers.forEach((value, key) => {
        // Forward essential headers from the origin server
        if (['content-type', 'content-length', 'accept-ranges', 'content-range'].includes(key.toLowerCase())) {
            responseHeaders.set(key, value);
        }
    });

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