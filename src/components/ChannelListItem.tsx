import { Card, CardContent } from "@/components/ui/card";
import { useTmdbPoster } from "@/hooks/useTmdbPoster";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChannelListItemProps {
  channel: {
    id: string | number;
    name: string;
    logo: string;
  };
  onClick: () => void;
  isActive: boolean;
}

const ChannelListItem = ({ channel, onClick, isActive }: ChannelListItemProps) => {
  const { posterUrl, isLoadingPoster } = useTmdbPoster(channel.name);

  const displayLogo = !isLoadingPoster && posterUrl !== '/placeholder.svg' ? posterUrl : channel.logo;

  return (
    <Card
      className={cn(
        "cursor-pointer hover:border-primary transition-all border-2",
        isActive ? "border-primary bg-primary/5" : "border-transparent"
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center p-3">
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
          {isLoadingPoster ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <img
              src={displayLogo}
              alt=""
              className="w-full h-full object-contain"
              onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
            />
          )}
        </div>
        <span className="text-sm font-medium line-clamp-2">{channel.name}</span>
      </CardContent>
    </Card>
  );
};

export default ChannelListItem;