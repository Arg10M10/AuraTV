"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import XtreamForm from "@/components/XtreamForm";
import XtreamContent from "@/components/XtreamContent";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Globe, Tv, Settings2, LogOut } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { fetchXtreamData, getStreamUrl, XtreamCredentials } from "@/lib/xtream";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MergedChannel {
  id: string | number;
  name: string;
  logo: string;
  url: string;
  country: string;
  categories: string[];
}

interface CountryGroup {
  name: string;
  channels: MergedChannel[];
}

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
  
  // Estado para Canales Públicos
  const [selectedCountry, setSelectedCountry] = useState<CountryGroup | null>(null);
  const [publicChannel, setPublicChannel] = useState<MergedChannel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Estado para Xtream
  const [xtreamCreds, setXtreamCreds] = useState<XtreamCredentials | null>(() => {
    const saved = localStorage.getItem("xtream_creds");
    return saved ? JSON.parse(saved) : null;
  });
  const [xtreamChannel, setXtreamChannel] = useState<any | null>(null);

  const { data: publicChannels, isLoading: isLoadingPublic } = useQuery({
    queryKey: ["iptvOrgChannels"],
    queryFn: fetchIptvOrgData,
    enabled: activeTab === "public"
  });

  const { data: xtreamData, isLoading: isLoadingXtream, error: xtreamError } = useQuery({
    queryKey: ["xtreamData", xtreamCreds],
    queryFn: () => fetchXtreamData(xtreamCreds!),
    enabled: !!xtreamCreds && activeTab === "xtream",
    retry: false,
  });

  const categories = useMemo(() => {
    if (!publicChannels) return [];
    const all = new Set(publicChannels.flatMap((c) => c.categories));
    return Array.from(all).sort();
  }, [publicChannels]);

  const filteredCountries = useMemo(() => {
    if (!publicChannels) return [];
    const filtered = publicChannels.filter(c => selectedCategory === "all" || c.categories.includes(selectedCategory));
    const grouped = filtered.reduce((acc, c) => {
      if (!acc[c.country]) acc[c.country] = { name: c.country, channels: [] };
      acc[c.country].channels.push(c);
      return acc;
    }, {} as Record<string, CountryGroup>);
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [publicChannels, selectedCategory]);

  const handleXtreamLogin = (url: string, user: string, pass: string) => {
    const creds = { url, user, pass };
    setXtreamCreds(creds);
    localStorage.setItem("xtream_creds", JSON.stringify(creds));
    showSuccess("Conectando al servidor...");
  };

  const handleLogout = () => {
    setXtreamCreds(null);
    setXtreamChannel(null);
    localStorage.removeItem("xtream_creds");
    showSuccess("Sesión cerrada");
  };

  const currentVideoUrl = useMemo(() => {
    if (activeTab === "public" && publicChannel) {
      // Usamos un proxy para evitar bloqueos de CORS en canales públicos si es necesario
      return publicChannel.url;
    }
    if (activeTab === "xtream" && xtreamChannel && xtreamCreds) {
      return getStreamUrl(xtreamCreds, xtreamChannel.stream_id);
    }
    return "";
  }, [activeTab, publicChannel, xtreamChannel, xtreamCreds]);

  const currentChannelName = useMemo(() => {
    if (activeTab === "public") return publicChannel?.name || "Selecciona un canal público";
    return xtreamChannel?.name || "Selecciona un canal Xtream";
  }, [activeTab, publicChannel, xtreamChannel]);

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Televisión en Vivo</h1>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <Button 
              variant={activeTab === "public" ? "default" : "ghost"}
              onClick={() => setActiveTab("public")}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" /> Públicos
            </Button>
            <Button 
              variant={activeTab === "xtream" ? "default" : "ghost"}
              onClick={() => setActiveTab("xtream")}
              className="flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" /> Xtream API
            </Button>
          </TabsList>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reproductor principal */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
              <h2 className="text-xl font-semibold truncate">
                {currentChannelName}
              </h2>
              {activeTab === "xtream" && xtreamCreds && (
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex gap-2">
                  <LogOut className="h-4 w-4" /> Salir
                </Button>
              )}
            </div>
            <Card className="overflow-hidden border-2 shadow-xl bg-black">
              <VideoPlayer url={currentVideoUrl} />
            </Card>
          </div>

          {/* Listado lateral */}
          <div className="space-y-4">
            {activeTab === "public" ? (
              <div className="mt-0">
                {isLoadingPublic ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Cargando canales públicos...</p>
                  </div>
                ) : !selectedCountry ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <Tv className="h-4 w-4" /> Países
                      </h3>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <ScrollArea className="h-[60vh] rounded-md border p-4">
                      <div className="grid gap-2">
                        {filteredCountries.map((country) => (
                          <Button
                            key={country.name}
                            variant="outline"
                            className="justify-between h-auto py-4 px-6 hover:bg-primary hover:text-primary-foreground transition-all group"
                            onClick={() => setSelectedCountry(country)}
                          >
                            <span className="font-semibold">{country.name}</span>
                            <span className="text-xs opacity-60 group-hover:opacity-100">
                              {country.channels.length}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCountry(null)}>
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <h3 className="font-bold">{selectedCountry.name}</h3>
                    </div>
                    <ScrollArea className="h-[60vh] rounded-md border p-4">
                      <div className="grid gap-3">
                        {selectedCountry.channels.map((channel) => (
                          <Card
                            key={channel.id}
                            className={`cursor-pointer hover:border-primary transition-all ${
                              publicChannel?.id === channel.id ? "border-primary ring-1 ring-primary" : ""
                            }`}
                            onClick={() => setPublicChannel(channel)}
                          >
                            <CardContent className="flex items-center p-3">
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center mr-3 overflow-hidden">
                                <img
                                  src={channel.logo}
                                  alt=""
                                  className="w-full h-full object-contain"
                                  onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                                />
                              </div>
                              <span className="text-sm font-medium line-clamp-1">{channel.name}</span>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-0">
                {!xtreamCreds ? (
                  <XtreamForm onLogin={handleXtreamLogin} />
                ) : isLoadingXtream ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Sincronizando Xtream...</p>
                  </div>
                ) : xtreamError ? (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    <p className="font-bold">Error de conexión</p>
                    <p className="text-sm">No pudimos conectar con tu servidor. Revisa tus credenciales o el estado del servidor.</p>
                    <Button variant="outline" className="mt-4 w-full" onClick={handleLogout}>
                      Intentar de nuevo
                    </Button>
                  </div>
                ) : (
                  <XtreamContent 
                    categories={xtreamData?.categories || []}
                    streams={xtreamData?.streams || []}
                    onSelectChannel={setXtreamChannel}
                    currentChannelId={xtreamChannel?.stream_id}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveTV;