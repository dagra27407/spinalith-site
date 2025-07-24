// app/views/CharactersView.tsx

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";

interface Characters {
  id: string;
  arc_title: string;
  arc_summary: string;
}

export default function CharactersView() {
  const [Characters, setCharacters] = useState<Characters[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharacters() {
      try {
        const res = await fetch("/api/characters"); // You’ll swap this to your Supabase client later
        const data = await res.json();
        setCharacters(data ?? []);
      } catch (error) {
        console.error("Error fetching Characters:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacters();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Characters</h1>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Arc
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[160px] w-full rounded-xl" />
            ))
          : Characters.map((arc) => (
              <Card key={arc.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-lg">{arc.arc_title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{arc.arc_summary}</p>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
