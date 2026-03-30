"use client";

import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Tv, ShieldCheck } from "lucide-react";
import { getXtreamLiveUrl, xtreamApiRequest } from "@/hooks/useXtream";

interface MergedChannel {
  id: string | number;
  name: string;
  logo: string;
  url: string;
  country: string;
}

const LiveTV = () => {
  const [activeTab, setActiveTab] = useState("xtream");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState<MergedChannel | null>(null);

  const results = useQueries({
    queries: [
      { queryKey: ['xtreamData', 'get_live_categories'], queryFn: () => xtreamApiRequest('get_live_categories'), staleTime: 1000 * 60 * 60 },
      { queryKey: ['xtreamData', 'get_live_streams'], queryFn: () => xtreamApiRequest('get_live_streams'), staleTime: 1000 * 60 * 60 },
    ]
  });

  const { data: categories, isLoading: loadingCats, error: catsError } = results[0];
  const { data: streams, isLoading: loadingStreams, error: streamsError } = results[1];

  const loadingXtream = loadingCats || loadingStreams;
  const xtreamError = catsError || streamsError;

  const filteredGroups = useMemo(() => {
    if (!categories || !streams || !Array.isArray(categories) || !Array.isArray(streams)) return [];
    
    return categories.map((cat: any) => ({
      name: cat.category_name,
      id: cat.category_id,
      channels: streams
        .filter((s: any) => s.category_id === cat.category_id)
        .map((s: any) => ({
          id: s.stream_id,
          name: s.name,
          logo: s.stream_icon || "/placeholder.svg",
          url: getXtreamLiveUrl(s.stream_id),
          country: cat.category_name
        }))
    })).filter((g: any) => g.channels.length > 0);
  }, [categories, streams]);

  const activeChannels = useMemo(() => {
    if (!selectedGroup) return [];
    const group = filteredGroups.find((g: any) => (g.id || g.name) === selectedGroup);
    return group?.channels || [];
  }, [selectedGroup, filteredGroups]);

  const currentVideoUrl = currentChannel ? currentChannel.url : "";

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">TV Familiar</h1>
            <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-1 rounded-md text-xs font-bold border border-green-200">
              <ShieldCheck className="h-3 w-3" /> CONECTADO
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="xtream">Canales Privados</TabsTrigger>
              <TabsTrigger value="public" disabled>Públicos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
              <h2 className="text-xl font-semibold truncate">
                {currentChannel?.name || "Selecciona un canal para empezar"}
              </h2>
              {currentChannel && (
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {currentChannel.country}
                </span>
              )}
            </div>
            <Card className="overflow-hidden border-2 shadow-xl bg-black aspect-video">
              <VideoPlayer 
                url={currentVideoUrl} 
              />
            </Card>
          </div>

          <div className="space-y-4">
            {loadingXtream ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Sincronizando con el servidor...</p>
              </div>
            ) : xtreamError ? (
              <Card className="border-destructive">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive font-bold">Error de conexión</p>
                  <p className="text-sm text-muted-foreground mt-2">No se pudo acceder a los canales. El proxy o el servidor pueden estar caídos.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {!selectedGroup ? (
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Tv className="h-4 w-4" /> Categorías Disponibles
                    </h3>
                    <ScrollArea className="h-[60vh] rounded-md border p-4 bg-card">
                      <div className="grid gap-2">
                        {filteredGroups.map((group: any) => (
                          <Button
                            key={group.id}
                            variant="outline"
                            className="justify-between h-auto py-4 px-6 hover:bg-primary hover:text-primary-foreground transition-all group"
                            onClick={() => setSelectedGroup(group.id)}
                          >
                            <span className="font-semibold text-left">{group.name}</span>
                            <span className="text-xs opacity-60 group-hover:opacity-100">
                              {group.channels.length} canales
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
                        {filteredGroups.find((g: any) => g.id === selectedGroup)?.name}
                      </h3>
                    </div>
                    <ScrollArea className="h-[60vh] rounded-md border p-4 bg-card">
                      <div className="grid gap-3">
                        {activeChannels.map((channel: any) => (
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
      </div>
    </Layout>
  );
};

export default LiveTV;