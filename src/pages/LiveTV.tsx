import { useState } from "react";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import { liveTvChannels } from "@/data/mock";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const LiveTV = () => {
  const [currentChannel, setCurrentChannel] = useState(liveTvChannels[0]);

  return (
    <Layout>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{currentChannel.name}</h1>
          <Card className="overflow-hidden">
            <VideoPlayer url={currentChannel.url} />
          </Card>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Canales</h2>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {liveTvChannels.map((channel) => (
                <Card
                  key={channel.name}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    currentChannel.name === channel.name ? "border-primary" : ""
                  }`}
                  onClick={() => setCurrentChannel(channel)}
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
        </div>
      </div>
    </Layout>
  );
};

export default LiveTV;