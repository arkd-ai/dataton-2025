'use client';

import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <header className="border-b border-white/10 bg-black/20 p-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Datatón 2025 <span className="text-white/30 text-base font-normal ml-2">| Sistema 1: Declaraciones</span>
        </h1>
      </header>
      <Dashboard />
    </main>
  );
}
