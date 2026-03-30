"use client";

import { useState } from "react";
import { cn, isAllowedImage } from "@/lib/utils";

interface ContentCardProps {
  title: string;
  imageUrl: string;
  onClick?: () => void;
  className?: string;
}

const ContentCard = ({ title, imageUrl, onClick, className }: ContentCardProps) => {
  const allowed = isAllowedImage(imageUrl);
  const [hasError, setHasError] = useState(!allowed);

  return (
    <button
      onClick={onClick}
      tabIndex={0}
      className={cn(
        "group relative flex flex-col w-full text-left transition-all duration-300 outline-none",
        "focus:scale-105 focus:z-10 focus:ring-4 focus:ring-primary/50",
        className
      )}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 border border-white/5 group-focus:border-primary shadow-2xl">
        {hasError ? (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center p-6 text-center">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter leading-tight px-2">
              {title}
            </span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
            loading="lazy"
          />
        )}
      </div>
      <h3 className="mt-2 text-[10px] font-bold text-zinc-600 group-focus:text-primary line-clamp-1 uppercase opacity-0 group-focus:opacity-100 transition-opacity">
        {title}
      </h3>
    </button>
  );
};

export default ContentCard;