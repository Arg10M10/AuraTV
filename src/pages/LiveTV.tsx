import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Nueva interfaz para los canales del M3U
interface M3uChannel {
  name: string;
  logo: string;
  url: string;
  group: string;
}

// Nueva interfaz para los grupos de canales
interface ChannelGroup {
  name: string;
  channels: M3uChannel[];
}

// Función para parsear el contenido de un M3U
const parseM3u = (m3uText: string): M3uChannel[] => {
  const channels: M3uChannel[] = [];
  const lines = m3uText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const infoLine = line;
      const urlLine = lines[i + 1]?.trim();

      if (urlLine && !urlLine.startsWith('#')) {
        const nameMatch = infoLine.match(/tvg-name="([^"]*)"/);
        const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
        const groupMatch = infoLine.match(/group-title="([^"]*)"/);

        // Usar el nombre después de la coma como fallback
        const nameFallback = infoLine.split(',').pop() || 'Canal sin nombre';
        
        const name = nameMatch ? nameMatch[1] : nameFallback;
        const logo = logoMatch ? logoMatch[1] : '/placeholder.svg';
        const group = groupMatch ? groupMatch[1] : 'General';
        
        channels.push({
          name,
          logo,
          url: urlLine,
          group,
        });
        i++; // Avanzar para saltar la línea de la URL ya procesada
      }
    }
  }
  return channels;
};


const fetchChannels = async (): Promise<M3uChannel[]> => {
  const response = await fetch(
    "https://pastebin.com/raw/YVBjE9ii"
  );
  if (!response.ok) {
    throw new Error("La respuesta de la red no fue correcta");
  }
  const m3uText = await response.text();
  return parseM3u(m3uText);
};

const LiveTV = () => {
  const [selectedGroup, setSelectedGroup] = useState<ChannelGroup | null>(null);
  const [currentChannel, setCurrentChannel] = useState<M3uChannel | null>(null);

  const {
    data: channels,
    isLoading,
    isError,
  } = useQuery<M3uChannel[]>({
    queryKey: ["movistarChannels"],
    queryFn: fetchChannels,
  });

  const groups = useMemo(() => {
    if (!channels) return [];
    const grouped = channels.reduce(
      (acc, channel) => {
        const groupName = channel.group;
        if (!acc[groupName]) {
          acc[groupName] = { name: groupName, channels: [] };
        }
        acc[groupName].channels.push(channel);
        return acc;
      },
      {} as Record<string, ChannelGroup>
    );

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [channels]);

  useEffect(() => {
    // Seleccionar el primer canal del primer grupo por defecto
    if (!currentChannel && groups.length > 0 && groups[0].channels.length > 0) {
      setCurrentChannel(groups[0].channels[0]);
    }
  }, [groups, currentChannel]);

  const handleGroupSelect = (group: ChannelGroup) => {
    setSelectedGroup(group);
  };

  const handleChannelSelect = (channel: M3uChannel) => {
    setCurrentChannel(channel);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-4 text-xl">Cargando canales...</span>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los canales. Por favor, inténtalo de nuevo más tarde.
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4 truncate">
            {currentChannel?.name || "Selecciona un canal"}
          </h1>
          <Card className="overflow-hidden">
            {currentChannel ? (
              <VideoPlayer url={currentChannel.url} />
            ) : (
              <div className="aspect-video w-full bg-black flex items-center justify-center">
                <p className="text-white">Por favor, selecciona un grupo y un canal.</p>
              </div>
            )}
          </Card>
        </div>
        <div>
          {!selectedGroup ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Grupos</h2>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  {groups.map((group) => (
                    <Card
                      key={group.name}
                      className="cursor-pointer transition-all hover:border-primary"
                      onClick={() => handleGroupSelect(group)}
                    >
                      <CardContent className="flex items-center p-4">
                        <span className="font-semibold">{group.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToGroups}
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
              </div>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  {selectedGroup.channels.map((channel) => (
                    <Card
                      key={channel.name}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        currentChannel?.url === channel.url ? "border-primary" : ""
                      }`}
                      onClick={() => handleChannelSelect(channel)}
                    >
                      <CardContent className="flex items-center p-4">
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-12 h-12 mr-4 object-contain bg-gray-200 dark:bg-gray-800 rounded-md p-1"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <span className="font-semibold flex-grow">{channel.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LiveTV;