"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import XtreamForm from "@/components/XtreamForm";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Globe, Tv, Settings2, LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

// Interfaces para la API Pública e Xtream
interface MergedChannel {
  id: string | number;
  name: string;
  logo: string;
  url: string;
  country: string;
  categories: string[];
}

interface XtreamConfig {
  server: string;
  user: string;
  pass: string;
}

const CORS_PROXY = "https://proxy.cors.sh/";

const fetchIptvOrgData = async (): Promise<MergedChannel[]> => {
  const [channelsRes, streamsRes, countriesRes, categoriesRes] = await Promise.all([
    fetch("https://iptv-org.github.io/api/channels.json"),
    fetch("https://iptv-org.github.io/api/streams.json"),
    fetch("https://iptv-org.github.io/api/countries.json"),
    fetch("https://iptv-org.github.io/api/categories.json"),
  ]);

  const channels = await channelsRes.json();
  const streams = await streamsRes.json();
  const countries = await countriesRes.json();
  const categories = await categoriesRes.json();

  const streamsMap = new Map();
  for (const stream of streams) {
    if (!streamsMap.has(stream.channel) || stream.status === 'online') {
      streamsMap.set(stream.channel, stream);
    }
  }

  const countriesMap = new Map(countries.map((c: any) => [c.code, c.name]));
  const categoriesMap = new Map(categories.map((c: any) => [c.id, c.name]));

  return channels
    .filter((c: any) => !c.is_nsfw && streamsMap.has(c.id))
    .map((c: any) => {
      const stream = streamsMap.get(c.id);
      return {
        id: c.id,
        name: c.name,
        logo: c.logo || "/placeholder.svg",
        url: stream.url,
        country: countriesMap.get(c.country) || c.country || "Varios",
        categories: (c.categories || []).map((id: string) => categoriesMap.get(id) || id),
      };
    });
};

const LiveTV = () => {
  const [activeTab, setActiveTab] = useState("public");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<MergedChannel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [xtreamConfig, setXtreamConfig] = useState<XtreamConfig | null>(null);

  // Cargar configuración guardada
  useEffect(() => {
    const saved = localStorage.getItem("xtream_config");
    if (saved) {
      setXtreamConfig(JSON.parse(saved));
      setActiveTab("xtream");
    }
  }, []);

  const handleXtreamLogin = (server: string, user: string, pass: string) => {
    // Normalizar URL del servidor
    const cleanServer = server.replace(/\/$/, "");
    const config = { server: cleanServer, user, pass };
    setXtreamConfig(config);
    localStorage.setItem("xtream_config", JSON.stringify(config));
    showSuccess("Conectado a Xtream Codes");
  };

  const handleLogout = () => {
    setXtreamConfig(null);
    localStorage.removeItem("xtream_config");
    setSelectedGroup(null);
    setCurrentChannel(null);
    showSuccess("Sesión cerrada");
  };

  // Query para canales públicos
  const { data: publicChannels, isLoading: loadingPublic } = useQuery({
    queryKey: ["iptvOrgChannels"],
    queryFn: fetchIptvOrgData,
    enabled: activeTab === "public"
  });

  // Query para canales Xtream
  const { data: xtreamData, isLoading: loadingXtream } = useQuery({
    queryKey: ["xtreamChannels", xtreamConfig],
    queryFn: async () => {
      if (!xtreamConfig) return null;
      const { server, user, pass } = xtreamConfig;
      
      const baseUrl = `${CORS_PROXY}${server}/player_api.php?username=${user}&password=${pass}`;
      
      const [catsRes, streamsRes] = await Promise.all([
        fetch(`${baseUrl}&action=get_live_categories`),
        fetch(`${baseUrl}&action=get_live_streams`)
      ]);

      const categories = await catsRes.json();
      const streams = await streamsRes.json();

      return { categories, streams };
    },
    enabled: !!xtreamConfig && activeTab === "xtream"
  });

  // Procesamiento de datos para la UI
  const categories = useMemo(() => {
    if (activeTab === "public") {
      if (!publicChannels) return [];
      return Array.from(new Set(publicChannels.flatMap((c) => c.categories))).sort();
    } else {
      return xtreamData?.categories?.map((c: any) => c.category_name).sort() || [];
    }
  }, [activeTab, publicChannels, xtreamData]);

  const filteredGroups = useMemo(() => {
    if (activeTab === "public") {
      if (!publicChannels) return [];
      const filtered = publicChannels.filter(c => selectedCategory === "all" || c.categories.includes(selectedCategory));
      const grouped = filtered.reduce((acc, c) => {
        if (!acc[c.country]) acc[c.country] = { name: c.country, channels: [] };
        acc[c.country].channels.push(c);
        return acc;
      }, {} as any);
      return Object.values(grouped).sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else {
      if (!xtreamData) return [];
      const cats = xtreamData.categories || [];
      return cats.map((cat: any) => ({
        name: cat.category_name,
        id: cat.category_id,
        channels: xtreamData.streams
          .filter((s: any) => s.category_id === cat.category_id)
          .map((s: any) => ({
            id: s.stream_id,
            name: s.name,
            logo: s.stream_icon || "/placeholder.svg",
            url: `${xtreamConfig?.server}/live/${xtreamConfig?.user}/${xtreamConfig?.pass}/${s.stream_id}.m3u8`,
            country: cat.category_name,
            categories: [cat.category_name]
          }))
      })).filter((g: any) => g.channels.length > 0);
    }
  }, [activeTab, publicChannels, xtreamData, selectedCategory, xtreamConfig]);

  const activeChannels = useMemo(() => {
    if (!selectedGroup) return [];
    const group = filteredGroups.find((g: any) => (g.id || g.name) === selectedGroup);
    return group?.channels || [];
  }, [selectedGroup, filteredGroups]);

  const isLoading = activeTab === "public" ? loadingPublic : loadingXtream;

  return (
    <Layout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Televisión en Vivo</h1>
          <div className="flex items-center gap-4">
            <TabsList className="grid w-[300px] grid-cols-2">
              <TabsTrigger value="public" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Públicos
              </TabsTrigger>
              <TabsTrigger value="xtream" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Xtream
              </TabsTrigger>
            </TabsList>
            {activeTab === "xtream" && xtreamConfig && (
              <Button variant="outline" size="icon" onClick={handleLogout} title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
              <h2 className="text-xl font-semibold truncate">
                {currentChannel?.name || "Selecciona un canal"}
              </h2>
              {currentChannel && (
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {currentChannel.country}
                </span>
              )}
            </div>
            <Card className="overflow-hidden border-2 shadow-xl bg-black">
              <VideoPlayer 
                url={currentChannel ? `${CORS_PROXY}${currentChannel.url}` : ""} 
              />
            </Card>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Cargando lista...</p>
              </div>
            ) : activeTab === "xtream" && !xtreamConfig ? (
              <XtreamForm onLogin={handleXtreamLogin} />
            ) : (
              <div className="space-y-4">
                {!selectedGroup ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <Tv className="h-4 w-4" /> {activeTab === "public" ? "Países" : "Categorías"}
                      </h3>
                      {activeTab === "public" && (
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Filtro" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <ScrollArea className="h-[60vh] rounded-md border p-4 bg-card">
                      <div className="grid gap-2">
                        {filteredGroups.map((group: any) => (
                          <Button
                            key={group.id || group.name}
                            variant="outline"
                            className="justify-between h-auto py-4 px-6 hover:bg-primary hover:text-primary-foreground transition-all group"
                            onClick={() => setSelectedGroup(group.id || group.name)}
                          >
                            <span className="font-semibold text-left">{group.name}</span>
                            <span className="text-xs opacity-60 group-hover:opacity-100">
                              {group.channels.length}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedGroup(null)}>
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <h3 className="font-bold truncate">
                        {filteredGroups.find((g: any) => (g.id || g.name) === selectedGroup)?.name}
                      </h3>
                    </div>
                    <ScrollArea className="h-[60vh] rounded-md border p-4 bg-card">
                      <div className="grid gap-3">
                        {activeChannels.map((channel: MergedChannel) => (
                          <Card
                            key={channel.id}
                            className={`cursor-pointer hover:border-primary transition-all border-2 ${
                              currentChannel?.id === channel.id ? "border-primary bg-primary/5" : "border-transparent"
                            }`}
                            onClick={() => setCurrentChannel(channel)}
                          >
                            <CardContent className="flex items-center p-3">
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                                <img
                                  src={channel.logo}
                                  alt=""
                                  className="w-full h-full object-contain"
                                  onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                                />
                              </div>
                              <span className="text-sm font-medium line-clamp-2">{channel.name}</span>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </Layout>
  );
};

export default LiveTV;