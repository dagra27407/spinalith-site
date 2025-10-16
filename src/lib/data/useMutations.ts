/**
 * useMutations(table)
 *
 * Plain-English: Tiny helper for writing to a Supabase table from forms/buttons.
 * You give it a table name (e.g., 'story_arcs') and it gives you 3 functions:
 *
 *  - insert(values)  → create a new row and return it
 *  - upsert(values)  → create or update a row (by id) and return it
 *  - remove(id)      → delete a row by id
 *
 * Plus some simple state for your UI:
 *  - loading … true while a request is in-flight (disable buttons, show spinner)
 *  - error   … last error message (show a toast or inline message)
 *
 * Why it exists:
 *  - So every form/page uses the same, predictable mutation pattern.
 *  - Centralized error/loader handling (less copy/paste in views).
 *
 * Usage example:
 *  const { insert, upsert, remove, loading, error } = useMutations('story_arcs');
 *  const res = await insert({ narrative_project_id: projectId, title: 'New Arc' });
 *  if (res.ok) { /* success! navigate or refresh  } else { /* show res.error  }
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Narrow result shapes for UI logic
export type MutationOk<T = any> = { ok: true; data?: T };
export type MutationErr = { ok: false; error: string };
export type MutationResult<T = any> = MutationOk<T> | MutationErr;

export function useMutations(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function insert<T = any>(values: Record<string, any>): Promise<MutationResult<T>> {
    setLoading(true); setError(undefined);
    const { data, error } = await supabase.from(table).insert(values).select('*').single();
    setLoading(false);
    if (error) { setError(error.message); return { ok: false, error: error.message }; }
    return { ok: true, data: data as T };
  }

  /**
   * upsert: create or update based on a conflict key (defaults to 'id').
   * If your table has a different primary key, pass it via idKey.
   */
  async function upsert<T = any>(values: Record<string, any>, idKey: string = 'id'): Promise<MutationResult<T>> {
    setLoading(true); setError(undefined);
    const { data, error } = await supabase.from(table).upsert(values, { onConflict: idKey }).select('*').single();
    setLoading(false);
    if (error) { setError(error.message); return { ok: false, error: error.message }; }
    return { ok: true, data: data as T };
  }

  /**
   * remove: delete by a column (defaults to 'id').
   * Use remove(value, 'story_arc_id') for tables whose PK isn't 'id'.
   */
  async function remove(value: string, idColumn: string = 'id'): Promise<MutationResult<void>> {
    setLoading(true); setError(undefined);
    const { error } = await supabase.from(table).delete().eq(idColumn, value);
    setLoading(false);
    if (error) { setError(error.message); return { ok: false, error: error.message }; }
    return { ok: true };
  }

  return { insert, upsert, remove, loading, error };
}