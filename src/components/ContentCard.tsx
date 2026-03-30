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
      // tabIndex={0} asegura que el control remoto de la TV pueda seleccionarlo
      tabIndex={0}
      className={cn(
        "group relative flex flex-col w-full text-left transition-all duration-300 outline-none",
        "focus:scale-110 focus:z-10 focus:ring-8 focus:ring-primary/50 focus:shadow-[0_0_40px_rgba(255,255,255,0.1)]", // Estilo TV
        className
      )}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border-2 border-white/5 group-focus:border-primary shadow-lg transition-all">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
        />
      </div>
      <h3 className="mt-3 text-xs font-bold text-zinc-500 group-focus:text-primary line-clamp-1 uppercase tracking-tighter opacity-0 group-focus:opacity-100 transition-opacity">
        {title}
      </h3>
    </button>
  );
};

export default ContentCard;