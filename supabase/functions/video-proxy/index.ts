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
      return new Response(JSON.stringify({ error: "URL de video no proporcionada" }), { status: 400 });
    }

    console.log("[video-proxy] Iniciando túnel para:", videoUrl);

    // Cabeceras de engaño para el CDN final
    const headers = new Headers({
      'User-Agent': 'IPTVSmarters/1.0.0',
      'Accept': '*/*',
      'Referer': '', // Referer vacío como pediste
      'Connection': 'keep-alive'
    });

    const range = req.headers.get('range');
    if (range) headers.set('range', range);

    // Petición al servidor inicial (redireccionará a limitedcdn.com)
    const response = await fetch(videoUrl, { 
      headers,
      redirect: 'follow' // SIGUE EL SALTO A HTTPS://LIMITEDCDN.COM AUTOMÁTICAMENTE
    });

    console.log("[video-proxy] CDN respondió con status:", response.status, "URL Final:", response.url);

    const responseHeaders = new Headers(corsHeaders);
    
    // Copiamos las cabeceras vitales para que el reproductor web pueda funcionar
    ['content-type', 'content-length', 'accept-ranges', 'content-range'].forEach(h => {
      const val = response.headers.get(h);
      if (val) responseHeaders.set(h, val);
    });

    // Si el CDN no dice qué es, le decimos al navegador que es video matroska/mkv
    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'video/x-matroska');
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("[video-proxy] Error crítico:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})