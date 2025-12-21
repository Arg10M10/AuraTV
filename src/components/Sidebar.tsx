import { Home, Film, Tv, Clapperboard } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-background text-foreground flex flex-col border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">StreamTV</h1>
      </div>
      <nav className="flex-grow px-4">
        <ul>
          <li className="mb-2">
            <a href="#" className="flex items-center p-3 rounded-lg text-lg hover:bg-accent">
              <Home className="mr-4" />
              Inicio
            </a>
          </li>
          <li className="mb-2">
            <a href="#" className="flex items-center p-3 rounded-lg text-lg hover:bg-accent">
              <Film className="mr-4" />
              Películas
            </a>
          </li>
          <li className="mb-2">
            <a href="#" className="flex items-center p-3 rounded-lg text-lg hover:bg-accent">
              <Tv className="mr-4" />
              Series
            </a>
          </li>
          <li className="mb-2">
            <a href="#" className="flex items-center p-3 rounded-lg text-lg hover:bg-accent">
              <Clapperboard className="mr-4" />
              TV en Vivo
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;