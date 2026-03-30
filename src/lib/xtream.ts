"use client";

import { createClient } from "@iptv/xtream-api";

export interface XtreamCredentials {
  url: string;
  user: string;
  pass: string;
}

export const getXtreamClient = (creds: XtreamCredentials) => {
  // Eliminamos '/' al final de la URL si existe
  const baseUrl = creds.url.replace(/\/$/, "");
  return createClient(baseUrl, creds.user, creds.pass);
};

export const fetchXtreamData = async (creds: XtreamCredentials) => {
  const client = getXtreamClient(creds);
  
  try {
    // Obtenemos categorías y canales en paralelo
    const [categories, streams] = await Promise.all([
      client.getLiveCategories(),
      client.getLiveStreams(),
    ]);

    return {
      categories,
      streams,
      client
    };
  } catch (error) {
    console.error("[Xtream] Error fetching data:", error);
    throw error;
  }
};

export const getStreamUrl = (creds: XtreamCredentials, streamId: string | number, extension: string = "m3u8") => {
  const baseUrl = creds.url.replace(/\/$/, "");
  return `${baseUrl}/live/${creds.user}/${creds.pass}/${streamId}.${extension}`;
};