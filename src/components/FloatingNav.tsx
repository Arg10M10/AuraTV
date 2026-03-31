import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Film, Tv, Home } from "lucide-react";

const FloatingNav = () => {
  const location = useLocation();

  const items = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/movies", icon: Film, label: "Películas" },
    { href: "/series", icon: Tv, label: "Series" },
  ];

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[90] flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
            location.pathname === item.href 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default FloatingNav;