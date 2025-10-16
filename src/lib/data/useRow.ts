/**
 * useRow<T>(table, id, options)
 *
 * Plain-English: Small hook to fetch **one row** from a Supabase table by `id`.
 * You give it a table name and an id (uuid string). It returns:
 *
 *  - row .......... the matching record (or null if not found)
 *  - loading ...... true while fetching
 *  - error ........ message string if something failed
 *  - refresh() .... call to re-fetch (e.g., after you saved edits elsewhere)
 *
 * Why it exists:
 *  - Detail pages and edit forms usually need to load a single record cleanly.
 *  - Centralizes the fetch + error handling so every screen behaves the same.
 *
 * Usage example:
 *  const { row, loading, error } = useRow<ArcRow>('story_arcs', arcId);
 *  if (loading) return <Spinner/>;
 *  if (error || !row) return <Empty/>;
 *  return <ArcDetails {...row} />;
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface UseRowOptions { select?: string; idColumn?: string; }
  /** Optional: override the selected columns (defaults to '*') */

export function useRow<T = any>(table: string, id: string | undefined, options: UseRowOptions = {}) {
  const [row, setRow] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const refreshKey = useRef(0);

  useEffect(() => {
    let aborted = false; // soft abort pattern

    async function run() {
      if (!id) { setRow(null); setLoading(false); return; }
      setLoading(true);
      setError(undefined);

      const { data, error } = await supabase
        .from(table)
        .select(options.select ?? '*')
        .eq(options.idColumn ?? 'id', id)   // <-- key line
        .single();

      if (aborted) return;

      if (error) {
        setError(error.message);
        setRow(null);
      } else {
        setRow((data ?? null) as T | null);
      }
      setLoading(false);
    }

    run();
    return () => { aborted = true; };
  }, [table, id, options.select, refreshKey.current]);

  function refresh() { refreshKey.current++; }

  return { row, loading, error, refresh } as const;
}
