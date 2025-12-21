import { useState } from "react";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import { countriesWithChannels } from "@/data/mock";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Channel {
  name: string;
  logo: string;
  url: string;
}

interface Country {
  name: string;
  flag: string;
  channels: Channel[];
}

const LiveTV = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(
    countriesWithChannels[0].channels[0]
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
  };

  const handleChannelSelect = (channel: Channel) => {
    setCurrentChannel(channel);
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
  };

  return (
    <Layout>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">
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
                  {countriesWithChannels.map((country) => (
                    <Card
                      key={country.name}
                      className="cursor-pointer transition-all hover:border-primary"
                      onClick={() => handleCountrySelect(country)}
                    >
                      <CardContent className="flex items-center p-4">
                        <span className="text-2xl mr-4">{country.flag}</span>
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
                <Button variant="ghost" size="icon" onClick={handleBackToCountries} className="mr-2">
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
                        currentChannel?.name === channel.name ? "border-primary" : ""
                      }`}
                      onClick={() => handleChannelSelect(channel)}
                    >
                      <CardContent className="flex items-center p-4">
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-12 h-12 mr-4 object-contain bg-gray-200 dark:bg-gray-800 rounded-md p-1"
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