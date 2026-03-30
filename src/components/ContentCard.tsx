import { cn } from "@/lib/utils";

interface ContentCardProps {
  title: string;
  imageUrl: string;
  onClick?: () => void;
  className?: string;
}

const ContentCard = ({ title, imageUrl, onClick, className }: ContentCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col w-full text-left transition-all duration-300 outline-none",
        "focus:scale-105 focus:z-10 focus:ring-4 focus:ring-white/20", // Efecto Apple TV
        className
      )}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted shadow-lg transition-all duration-300 group-focus:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-focus:brightness-110">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
        />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground/80 group-focus:text-foreground line-clamp-1 opacity-0 group-focus:opacity-100 transition-opacity">
        {title}
      </h3>
    </button>
  );
};

export default ContentCard;