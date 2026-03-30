import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import XtreamForm from "@/components/XtreamForm";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Globe, Tv, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interfaces para la API Pública
interface MergedChannel {
  id: string;
  name: string;
  logo: string;
  url: string;
  country: string;
  status: string;
  categories: string[];
  languages: string[];
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
        status: stream.status,
        categories: (c.categories || []).map((id: string) => categoriesMap.get(id) || id),
      };
    });
};

const LiveTV = () => {
  const [activeTab, setActiveTab] = useState("public");
  const [selectedCountry, setSelectedCountry] = useState<CountryGroup | null>(null);
  const [currentChannel, setCurrentChannel] = useState<MergedChannel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: channels, isLoading } = useQuery<MergedChannel[]>({
    queryKey: ["iptvOrgChannels"],
    queryFn: fetchIptvOrgData,
    enabled: activeTab === "public"
  });

  const categories = useMemo(() => {
    if (!channels) return [];
    const all = new Set(channels.flatMap((c) => c.categories));
    return Array.from(all).sort();
  }, [channels]);

  const filteredCountries = useMemo(() => {
    if (!channels) return [];
    const filtered = channels.filter(c => selectedCategory === "all" || c.categories.includes(selectedCategory));
    const grouped = filtered.reduce((acc, c) => {
      if (!acc[c.country]) acc[c.country] = { name: c.country, channels: [] };
      acc[c.country].channels.push(c);
      return acc;
    }, {} as Record<string, CountryGroup>);
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [channels, selectedCategory]);

  const handleXtreamLogin = (server: string, user: string, pass: string) => {
    console.log("Conectando a Xtream:", { server, user, pass });
    alert("Función Xtream configurada. Conecta tus datos para empezar.");
  };

  if (isLoading && activeTab === "public") {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-xl font-medium">Sintonizando canales...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Televisión en Vivo</h1>
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Públicos
            </TabsTrigger>
            <TabsTrigger value="xtream" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Xtream API
            </TabsTrigger>
          </TabsList>
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
              <VideoPlayer url={currentChannel ? `https://proxy.cors.sh/${currentChannel.url}` : ""} />
            </Card>
          </div>

          <div className="space-y-4">
            <TabsContent value="public" className="mt-0 border-0 p-0">
              {!selectedCountry ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <Tv className="h-4 w-4" /> Lista de Países
                    </h3>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
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
                            {country.channels.length} canales
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
                            currentChannel?.id === channel.id ? "border-primary ring-1 ring-primary" : ""
                          }`}
                          onClick={() => setCurrentChannel(channel)}
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
            </TabsContent>

            <TabsContent value="xtream" className="mt-0 border-0 p-0">
              <XtreamForm onLogin={handleXtreamLogin} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </Layout>
  );
};

export default LiveTV;