"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Toaster } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/60 flex">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Centralized Sonner notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
