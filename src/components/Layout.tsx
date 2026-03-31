import React from "react";
import FloatingNav from "./FloatingNav";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-primary selection:text-primary-foreground">
      <FloatingNav />
      <main className="pt-32 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;