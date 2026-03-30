import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, stream_id } = await req.json()
    
    // Datos configurados por el usuario
    const SERVER = "http://kytv.xyz"
    const USER = "7882659395"
    const PASS = Deno.env.get('XTREAM_PASSWORD')

    if (!PASS) {
      console.error("[xtream-proxy] XTREAM_PASSWORD secret not found")
      return new Response(JSON.stringify({ error: "Configuración incompleta" }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    let url = `${SERVER}/player_api.php?username=${USER}&password=${PASS}&action=${action}`
    
    console.log(`[xtream-proxy] Fetching: ${action}`)
    
    const response = await fetch(url)
    const data = await response.json()

    // Si la acción es obtener el stream, devolvemos también la URL base construida con el secret
    // para que el frontend pueda armar el enlace del video
    const result = {
      data,
      credentials: {
        server: SERVER,
        user: USER,
        pass: PASS // Se envía al cliente para el reproductor (uso familiar interno)
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("[xtream-proxy] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})