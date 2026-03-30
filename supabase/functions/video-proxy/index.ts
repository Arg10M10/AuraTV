import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Expose-Headers': 'content-type, content-length, accept-ranges, content-range',
}

serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get('url');

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "URL de video no proporcionada" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparamos las cabeceras para la petición al servidor IPTV
    const headers = new Headers({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
    });

    // IMPORTANTE: Reenviar la cabecera Range para permitir el "seeking" (adelantar/atrasar)
    const range = req.headers.get('range');
    if (range) {
      headers.set('range', range);
    }

    const response = await fetch(videoUrl, { 
      headers,
      redirect: 'follow'
    });

    // Construimos las cabeceras de respuesta
    const responseHeaders = new Headers(corsHeaders);
    
    // Mapeamos cabeceras críticas del servidor original
    const criticalHeaders = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
    response.headers.forEach((value, key) => {
      if (criticalHeaders.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    // Si es MKV y el servidor no envía el tipo correcto, lo forzamos para el navegador
    if (videoUrl.toLowerCase().includes('.mkv') && !responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'video/x-matroska');
    }

    // Retornamos el flujo de datos (stream) directamente
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("[video-proxy] Error crítico:", error.message);
    return new Response(JSON.stringify({ error: "Error en el túnel de video", details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})