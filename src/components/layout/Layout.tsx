import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Scanline Effect */}
      <div className="scanline opacity-30" />
      
      {/* Grid Overlay */}
      <div className="fixed inset-0 grid-overlay opacity-20 pointer-events-none" />
      
      {/* Ambient Glow Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      <Navbar />
      
      <main className="relative z-10 pt-16">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/20 bg-background/80 backdrop-blur-sm py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-mono text-sm">
            <span className="text-primary">&gt;</span> ZeroDay Squad © 2026
            <span className="text-secondary ml-2">|</span>
            <span className="ml-2">Securing the digital frontier</span>
            <span className="terminal-text ml-1">_</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
