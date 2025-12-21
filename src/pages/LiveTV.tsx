import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiChannel {
  name: string;
  logo: string;
  url: string;
  country: {
    code: string;
    name: string;
  };
}

interface Country {
  name: string;
  channels: ApiChannel[];
}

const fetchChannels = async (): Promise<ApiChannel[]> => {
  const response = await fetch(
    "https://raw.githubusercontent.com/Free-TV/IPTV/master/channels.json"
  );
  if (!response.ok) {
    throw new Error("La respuesta de la red no fue correcta");
  }
  // Filtramos canales sin URL válida
  const channels = await response.json();
  return channels.filter((channel: ApiChannel) => channel.url);
};

const LiveTV = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [currentChannel, setCurrentChannel] = useState<ApiChannel | null>(null);

  const {
    data: channels,
    isLoading,
    isError,
  } = useQuery<ApiChannel[]>({
    queryKey: ["liveChannels"],
    queryFn: fetchChannels,
  });

  const countries = useMemo(() => {
    if (!channels) return [];
    const grouped = channels.reduce(
      (acc, channel) => {
        const countryName = channel.country.name;
        if (!acc[countryName]) {
          acc[countryName] = { name: countryName, channels: [] };
        }
        acc[countryName].channels.push(channel);
        return acc;
      },
      {} as Record<string, Country>
    );

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [channels]);

  useEffect(() => {
    if (!currentChannel && countries.length > 0 && countries[0].channels.length > 0) {
      setCurrentChannel(countries[0].channels[0]);
    }
  }, [countries, currentChannel]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
  };

  const handleChannelSelect = (channel: ApiChannel) => {
    setCurrentChannel(channel);
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
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
                <p className="text-white">Por favor, selecciona un país y un canal.</p>
              </div>
            )}
          </Card>
        </div>
        <div>
          {!selectedCountry ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Países</h2>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  {countries.map((country) => (
                    <Card
                      key={country.name}
                      className="cursor-pointer transition-all hover:border-primary"
                      onClick={() => handleCountrySelect(country)}
                    >
                      <CardContent className="flex items-center p-4">
                        <span className="font-semibold">{country.name}</span>
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
                  onClick={handleBackToCountries}
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold">{selectedCountry.name}</h2>
              </div>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  {selectedCountry.channels.map((channel) => (
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
                        <span className="font-semibold">{channel.name}</span>
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