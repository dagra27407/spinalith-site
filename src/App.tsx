import React from "react";
import { WaitlistForm } from "./components/WaitlistForm";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">Spinalith</div>
          <nav className="text-sm">
            <a href="#features" className="hover:underline">Features</a>
          </nav>
        </div>
      </header>

      <main className="px-6">
        <section className="max-w-6xl mx-auto py-20">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Story planning that feels like a writers’ room.
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Spinalith helps authors design arcs, beats, and chapters with AI—then
            grow them into publish-ready narratives.
          </p>

          <div className="mt-8">
            <WaitlistForm source="site-hero" />
            <p className="mt-2 text-xs text-gray-500">
              No spam. Early access updates only.
            </p>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto py-16 border-t">
          <h2 className="text-2xl font-semibold">What’s coming</h2>
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <li className="p-4 border rounded-lg">
              <div className="font-medium">Arc & Beat Designer</div>
              <div className="text-gray-600 mt-1">Craft story arcs and beats with structure-aware AI.</div>
            </li>
            <li className="p-4 border rounded-lg">
              <div className="font-medium">Chapter Planner</div>
              <div className="text-gray-600 mt-1">Map beats to chapters with device-aware enrichment.</div>
            </li>
            <li className="p-4 border rounded-lg">
              <div className="font-medium">Callback Engine</div>
              <div className="text-gray-600 mt-1">Foreshadowing and callbacks tracked across the book.</div>
            </li>
          </ul>
        </section>
      </main>

      <footer className="px-6 py-8 border-t">
        <div className="max-w-6xl mx-auto text-sm text-gray-600 flex flex-wrap gap-4 justify-between">
          <div>© {new Date().getFullYear()} Spinalith</div>
          <div className="space-x-4">
            <a className="hover:underline" href="/privacy.html">Privacy</a>
            <a className="hover:underline" href="/terms.html">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
