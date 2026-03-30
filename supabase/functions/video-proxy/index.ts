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
      return new Response("URL missing", { status: 400 });
    }

    console.log(`[video-proxy] Tunelizando: ${videoUrl}`);

    const headers = new Headers();
    const range = req.headers.get('range');
    if (range) headers.set('range', range);
    
    // User-Agent de Smart TV para engañar al servidor IPTV y evitar bloqueos
    headers.set('User-Agent', 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36');

    const response = await fetch(videoUrl, { 
      headers,
      redirect: 'follow'
    });

    const responseHeaders = new Headers(corsHeaders);
    
    // Copiamos las cabeceras vitales del servidor original
    const copyHeaders = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
    copyHeaders.forEach(h => {
      const val = response.headers.get(h);
      if (val) responseHeaders.set(h, val);
    });

    // Forzamos el tipo si es MKV para que el reproductor lo reconozca
    if (videoUrl.toLowerCase().includes('.mkv')) {
      responseHeaders.set('content-type', 'video/x-matroska');
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }
})