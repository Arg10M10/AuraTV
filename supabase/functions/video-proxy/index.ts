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

    // Preparamos las cabeceras para engañar al CDN
    const headers = new Headers({
      'User-Agent': 'IPTVSmarters/1.0.0', // EL CDN CREE QUE ES LA APP OFICIAL
      'Accept': '*/*',
      'Referer': '', // REFERER VACÍO PARA MÁXIMO ANONIMATO
      'Connection': 'keep-alive'
    });

    // Reenviamos la cabecera Range para permitir el "seeking" en 4K
    const range = req.headers.get('range');
    if (range) {
      headers.set('range', range);
    }

    // Petición al servidor/CDN original
    const response = await fetch(videoUrl, { 
      headers,
      redirect: 'follow' // SIGUE AUTOMÁTICAMENTE LA REDIRECCIÓN A LIMITEDCDN.COM
    });

    // Construimos las cabeceras de respuesta para el navegador
    const responseHeaders = new Headers(corsHeaders);
    
    // Mapeamos cabeceras críticas del servidor original
    const criticalHeaders = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
    response.headers.forEach((value, key) => {
      if (criticalHeaders.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    // Forzamos el tipo de video si es necesario para el navegador
    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'video/x-matroska');
    }

    // Retornamos el flujo de datos (stream) directamente sin procesar
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("[video-proxy] Error en el túnel:", error.message);
    return new Response(JSON.stringify({ error: "Error en el túnel de video 4K" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})