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
    <aside className="fixed top-0 left-0 h-screen w-64 bg-background text-foreground flex flex-col border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">StreamTV</h1>
      </div>
      <nav className="flex-grow px-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                to={item.href}
                className={cn(
                  "flex items-center p-3 rounded-lg text-lg hover:bg-accent",
                  location.pathname === item.href &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="mr-4 h-5 w-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;