import { CapacitorVideoPlayer } from 'capacitor-video-player';
import { Capacitor } from '@capacitor/core';

export const playNatively = async (url: string, title: string, poster: string) => {
  if (Capacitor.getPlatform() === 'web') {
    console.warn("El reproductor nativo solo funciona en Android/iOS. En web se simulará la apertura.");
    window.open(url, '_blank');
    return;
  }

  try {
    await CapacitorVideoPlayer.initPlayer({
      mode: 'fullscreen',
      url: url,
      playerId: 'fullscreen',
      componentTag: 'div', // Requerido por el plugin
      title: title,
      title_color: '#ffffff',
      back_color: '#000000',
      // ESTO ES LO MÁS IMPORTANTE: Los headers que exige kytv.xyz
      httpHeaders: {
        'User-Agent': 'IPTVSmarters/1.0.0'
      }
    });
    
    console.log(`[NativePlayer] Reproduciendo: ${title}`);
  } catch (error) {
    console.error("[NativePlayer] Error al iniciar:", error);
  }
};