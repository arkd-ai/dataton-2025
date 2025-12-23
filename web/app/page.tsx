'use client';

import Dashboard from "@/components/Dashboard";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Map, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [view, setView] = useState<'explorer' | 'community'>('explorer');

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <header className="border-b border-white/10 bg-black/20 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 text-center sm:text-left">
            Datatón 2025 <span className="text-white/30 text-sm sm:text-base font-normal block sm:inline"></span>
          </h1>

          <nav className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10 w-full sm:w-auto justify-center">
            <button
              onClick={() => setView('explorer')}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                view === 'explorer'
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Map className="w-4 h-4" />
              <span className="hidden xs:inline">Explorador de Datos</span>
              <span className="xs:hidden">Explorar</span>
            </button>
            <button
              onClick={() => setView('community')}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                view === 'community'
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="hidden xs:inline">Reportes de la Comunidad</span>
              <span className="xs:hidden">Comunidad</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                Iniciar Sesión
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>
      <Dashboard view={view} onViewChange={setView} />
    </main>
  );
}
