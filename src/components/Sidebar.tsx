import { Home, Film, Tv, Clapperboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/movies", icon: Film, label: "Películas" },
  { href: "/series", icon: Tv, label: "Series" },
  { href: "/live-tv", icon: Clapperboard, label: "TV en Vivo" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-zinc-950 text-white flex flex-col border-r border-white/5 z-50">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter text-white italic">AURA <span className="text-primary not-italic">TV</span></h1>
      </div>
      <nav className="flex-grow px-4 mt-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center p-4 rounded-2xl text-lg font-medium transition-all duration-300",
                  "hover:bg-white/10 hover:translate-x-1",
                  location.pathname === item.href 
                    ? "bg-white/15 text-white shadow-lg ring-1 ring-white/20" 
                    : "text-zinc-500"
                )}
              >
                <item.icon className={cn("mr-4 h-5 w-5", location.pathname === item.href ? "text-primary" : "")} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-8 text-xs text-zinc-600 font-medium tracking-widest">
        POWERED BY XTREAM
      </div>
    </aside>
  );
};

export default Sidebar;