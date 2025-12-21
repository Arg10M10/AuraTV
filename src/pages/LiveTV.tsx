import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Globe } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interfaces para la API
interface IptvOrgChannel {
  id: string;
  name: string;
  logo: string | null;
  country: string;
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
}

interface IptvOrgStream {
  channel: string;
  url: string;
  status: string;
}

interface IptvOrgCountry {
  code: string;
  name: string;
}

interface IptvOrgCategory {
  id: string;
  name: string;
}

interface IptvOrgLanguage {
  code: string;
  name: string;
}

// Interfaz para el canal combinado
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

// Interfaz para el grupo de países
interface CountryGroup {
  name: string;
  channels: MergedChannel[];
}

const fetchIptvOrgData = async (): Promise<MergedChannel[]> => {
  const [
    channelsRes,
    streamsRes,
    countriesRes,
    categoriesRes,
    languagesRes,
  ] = await Promise.all([
    fetch("https://iptv-org.github.io/api/channels.json"),
    fetch("https://iptv-org.github.io/api/streams.json"),
    fetch("https://iptv-org.github.io/api/countries.json"),
    fetch("https://iptv-org.github.io/api/categories.json"),
    fetch("https://iptv-org.github.io/api/languages.json"),
  ]);

  if (
    !channelsRes.ok ||
    !streamsRes.ok ||
    !countriesRes.ok ||
    !categoriesRes.ok ||
    !languagesRes.ok
  ) {
    throw new Error("Error al cargar los datos: Uno de los archivos de la API no se pudo obtener.");
  }

  const channels: IptvOrgChannel[] = await channelsRes.json();
  const streams: IptvOrgStream[] = await streamsRes.json();
  const countries: IptvOrgCountry[] = await countriesRes.json();
  const categories: IptvOrgCategory[] = await categoriesRes.json();
  const languages: IptvOrgLanguage[] = await languagesRes.json();

  if (
    !channels?.length ||
    !streams?.length ||
    !countries?.length ||
    !categories?.length ||
    !languages?.length
  ) {
    throw new Error("Error: La API devolvió datos vacíos o en un formato inesperado.");
  }

  const streamsMap = new Map<string, IptvOrgStream>();
  for (const stream of streams) {
    if (!streamsMap.has(stream.channel) || (streamsMap.get(stream.channel)?.status !== 'online' && stream.status === 'online')) {
      streamsMap.set(stream.channel, stream);
    }
  }

  const countriesMap = new Map<string, string>(countries.map((c) => [c.code, c.name]));
  const categoriesMap = new Map<string, string>(categories.map((c) => [c.id, c.name]));
  const languagesMap = new Map<string, string>(languages.map((l) => [l.code, l.name]));

  const mergedChannels: MergedChannel[] = [];
  for (const channel of channels) {
    if (channel.is_nsfw) continue;

    const stream = streamsMap.get(channel.id);
    if (stream) {
      mergedChannels.push({
        id: channel.id,
        name: channel.name,
        logo: channel.logo || "/placeholder.svg",
        url: stream.url,
        country: countriesMap.get(channel.country) || channel.country || "Varios",
        status: stream.status,
        categories: (channel.categories || []).map((catId) => categoriesMap.get(catId) || catId),
        languages: (channel.languages || []).map((langCode) => languagesMap.get(langCode) || langCode),
      });
    }
  }

  if (mergedChannels.length === 0) {
    throw new Error("No se pudo combinar ningún canal.");
  }

  return mergedChannels;
};

const LiveTV = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryGroup | null>(null);
  const [currentChannel, setCurrentChannel] = useState<MergedChannel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  const { data: channels, isLoading, isError, error } = useQuery<MergedChannel[]>({
    queryKey: ["iptvOrgChannels"],
    queryFn: fetchIptvOrgData,
  });

  const categories = useMemo(() => {
    if (!channels) return [];
    const allCategories = new Set(channels.flatMap((c) => c.categories));
    return Array.from(allCategories).sort();
  }, [channels]);

  const languages = useMemo(() => {
    if (!channels) return [];
    const allLanguages = new Set(channels.flatMap((c) => c.languages));
    return Array.from(allLanguages).sort();
  }, [channels]);

  const filteredCountries = useMemo(() => {
    if (!channels) return [];

    const filteredChannels = channels.filter((channel) => {
      const categoryMatch = selectedCategory === "all" || channel.categories.includes(selectedCategory);
      const languageMatch = selectedLanguage === "all" || channel.languages.includes(selectedLanguage);
      return categoryMatch && languageMatch;
    });

    const grouped = filteredChannels.reduce((acc, channel) => {
      const countryName = channel.country;
      if (!acc[countryName]) {
        acc[countryName] = { name: countryName, channels: [] };
      }
      acc[countryName].channels.push(channel);
      return acc;
    }, {} as Record<string, CountryGroup>);

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [channels, selectedCategory, selectedLanguage]);

  useEffect(() => {
    if (!currentChannel && filteredCountries.length > 0 && filteredCountries[0].channels.length > 0) {
      setCurrentChannel(filteredCountries[0].channels[0]);
    }
  }, [filteredCountries, currentChannel]);

  const handleCountrySelect = (country: CountryGroup) => setSelectedCountry(country);
  const handleChannelSelect = (channel: MergedChannel) => setCurrentChannel(channel);
  const handleBackToCountries = () => setSelectedCountry(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-4 text-xl">Cargando miles de canales...</span>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertTitle>Error al cargar canales</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Ocurrió un error desconocido."}
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
              <div className="flex gap-4 mb-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los idiomas</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[55vh] pr-4">
                {filteredCountries.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCountries.map((country) => (
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
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-center">
                      No se encontraron canales con los filtros seleccionados.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" onClick={handleBackToCountries} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold">{selectedCountry.name}</h2>
              </div>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  {selectedCountry.channels.map((channel) => (
                    <Card
                      key={channel.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        currentChannel?.id === channel.id ? "border-primary" : ""
                      }`}
                      onClick={() => handleChannelSelect(channel)}
                    >
                      <CardContent className="flex items-center p-4">
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-12 h-12 mr-4 object-contain bg-gray-200 dark:bg-gray-800 rounded-md p-1"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        <span className="font-semibold flex-grow">{channel.name}</span>
                        {channel.status === "geoblocked" && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Globe className="h-5 w-5 text-muted-foreground ml-2" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Este canal puede estar bloqueado en tu región.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
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