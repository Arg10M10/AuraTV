export const movies = [
  { id: 1, title: "Película de Aventura", imageUrl: "/placeholder.svg" },
  { id: 2, title: "Comedia Familiar", imageUrl: "/placeholder.svg" },
  { id: 3, title: "Drama Intenso", imageUrl: "/placeholder.svg" },
  { id: 4, title: "Ciencia Ficción Épica", imageUrl: "/placeholder.svg" },
  { id: 5, title: "Thriller de Suspenso", imageUrl: "/placeholder.svg" },
];

export const series = [
  { id: 1, title: "Serie de Fantasía", imageUrl: "/placeholder.svg" },
  { id: 2, title: "Sitcom de Oficina", imageUrl: "/placeholder.svg" },
  { id: 3, title: "Misterio y Crimen", imageUrl: "/placeholder.svg" },
  { id: 4, title: "Documental de Naturaleza", imageUrl: "/placeholder.svg" },
  { id: 5, title: "Animación para Adultos", imageUrl: "/placeholder.svg" },
];

export const liveChannels = [
  { id: 1, title: "Canal de Noticias 24h", imageUrl: "/placeholder.svg" },
  { id: 2, title: "Canal de Deportes", imageUrl: "/placeholder.svg" },
  { id: 3, title: "Canal de Películas Clásicas", imageUrl: "/placeholder.svg" },
  { id: 4, title: "Canal de Música", imageUrl: "/placeholder.svg" },
  { id: 5, title: "Canal Infantil", imageUrl: "/placeholder.svg" },
];

export const countriesWithChannels = [
  {
    name: "Chile",
    flag: "🇨🇱",
    channels: [
      {
        name: "24 Horas",
        logo: "https://raw.githubusercontent.com/Free-TV/IPTV/master/logos/24Horas.cl.png",
        url: "https://mdstrm.com/live-stream-playlist/57d1a22064f5d85712b20dab.m3u8",
      },
    ],
  },
  {
    name: "EE.UU.",
    flag: "🇺🇸",
    channels: [
      {
        name: "Bloomberg TV",
        logo: "https://raw.githubusercontent.com/Free-TV/IPTV/master/logos/BloombergTV.us.png",
        url: "https://live-streams.bloomberg.com/live/bblive/playlist.m3u8",
      },
    ],
  },
  {
    name: "Internacional",
    flag: "🌍",
    channels: [
      {
        name: "Red Bull TV",
        logo: "https://raw.githubusercontent.com/Free-TV/IPTV/master/logos/RedBullTV.int.png",
        url: "https://rbmn-live.akamaized.net/hls/live/590964/rbmn_live/main.m3u8",
      },
    ],
  },
  {
    name: "Francia",
    flag: "🇫🇷",
    channels: [
      {
        name: "France 24",
        logo: "https://raw.githubusercontent.com/Free-TV/IPTV/master/logos/France24English.fr.png",
        url: "https://f24hls-i.akamaihd.net/hls/live/221192/F24_EN_HI_HLS/master.m3u8",
      },
    ],
  },
  {
    name: "España",
    flag: "🇪🇸",
    channels: [
      {
        name: "Canal Parlamento",
        logo: "https://raw.githubusercontent.com/Free-TV/IPTV/master/logos/CanalParlamento.es.png",
        url: "https://livestreaminges.ondirecto.com/parlamentohls/live.m3u8",
      },
    ],
  },
];