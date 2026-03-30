"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tv, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { proxyImage } from "@/lib/utils";

interface XtreamContentProps {
  categories: any[];
  streams: any[];
  onSelectChannel: (stream: any) => void;
  currentChannelId?: string | number;
}

const XtreamContent = ({ categories, streams, onSelectChannel, currentChannelId }: XtreamContentProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStreams = useMemo(() => {
    return streams.filter((s) => {
      const matchesCategory = selectedCategoryId === "all" || s.category_id === selectedCategoryId;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [streams, selectedCategoryId, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar canal..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[60vh] rounded-md border p-4">
        <div className="grid gap-3">
          {filteredStreams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No se encontraron canales</p>
          ) : (
            filteredStreams.map((stream) => (
              <Card
                key={stream.stream_id}
                className={`cursor-pointer hover:border-primary transition-all ${
                  currentChannelId === stream.stream_id ? "border-primary ring-1 ring-primary" : ""
                }`}
                onClick={() => onSelectChannel(stream)}
              >
                <CardContent className="flex items-center p-3">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center mr-3 overflow-hidden">
                    {stream.stream_icon ? (
                      <img
                        src={proxyImage(stream.stream_icon)}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <Tv className="h-5 w-5 opacity-40" />
                    )}
                  </div>
                  <span className="text-sm font-medium line-clamp-1">{stream.name}</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default XtreamContent;