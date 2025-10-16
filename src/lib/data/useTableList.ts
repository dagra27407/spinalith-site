/**
 * useTableList<T>(table, options)
 *
 * Plain-English: This is a tiny helper for pages that show a table/list.
 * You tell it which Supabase table to read (e.g., 'story_arcs'), and it gives you:
 *
 *  - rows .......... the current page of results to render
 *  - total ......... total number of rows in the table (for pagination)
 *  - page/pageSize . page number and page size
 *  - setPage() ..... go to another page (Prev/Next buttons)
 *  - setSearch() ... filter rows by a search term across specific columns
 *  - loading/error . booleans/strings for showing spinners or messages
 *  - refresh() ..... manually re-run the query after you change data elsewhere
 *
 * What it does under the hood (so future-you can trust it at 2am):
 *  1) Builds a Supabase SELECT for the given table.
 *  2) Applies any fixed filters you pass (e.g., narrative_project_id).
 *  3) If you provide search columns, it does a case-insensitive "ilike" match across them.
 *  4) Applies ordering and pagination (range) for you.
 *  5) Saves results into React state and exposes simple values + setters.
 *
 * Why it exists:
 *  - So every list page in Spinalith behaves the same.
 *  - So we don't keep re-writing the same fetch/pagination logic.
 *
 * How to use:
 *  const list = useTableList<ArcRow>('story_arcs', {
 *    filters: { narrative_project_id: projectId },
 *    searchCols: ['title','summary'],
 *    orderBy: ['importance_weight', { ascending: false }],
 *    pageSize: 10,
 *  });
 *
 * Then render: list.rows, and hook up search → list.setSearch(q),
 * Prev/Next → list.setPage(n), and show a spinner if list.loading.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/** Result envelope for list hooks */
export type ListResult<T> = {
  /** True while fetching */
  loading: boolean;
  /** Error message, if any */
  error?: string;
  /** Current page rows */
  rows: T[];
  /** Current page number (1-indexed) */
  page: number;
  /** Page size */
  pageSize: number;
  /** Total row count across all pages (from Supabase count) */
  total: number;
  /** Set current page (1-indexed) */
  setPage: (p: number) => void;
  /** Update search term (debounce in caller if desired) */
  setSearch: (q: string) => void;
  /** Force a re-fetch (e.g., after a mutation elsewhere) */
  refresh: () => void;
};

export interface ListOptions {
  /** Optional starting search term; call setSearch to change */
  search?: string;
  /** Columns to apply ilike search against (e.g., ['title','summary']) */
  searchCols?: string[];
  /** Order by tuple like ['created_at', { ascending: false }] */
  orderBy?: [string, { ascending?: boolean }];
  /** Fixed equality filters applied as .eq(k,v) or .is(k,null) */
  filters?: Record<string, string | number | boolean | null>;
  /** Page size; default 10 */
  pageSize?: number;
}

/**
 * useTableList
 * Generic paginated list hook for a Supabase table.
 *
 * @example
 * const { rows, loading, error, total, page, setPage, setSearch } = useTableList<ArcRow>('story_arcs', {
 *   filters: { narrative_project_id: projectId },
 *   searchCols: ['title','summary'],
 *   orderBy: ['importance_weight', { ascending: false }],
 *   pageSize: 10,
 * });
 */
export function useTableList<T = any>(table: string, options: ListOptions = {}): ListResult<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(options.pageSize ?? 10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState(options.search ?? '');
  const refreshKey = useRef(0);
  const fetchedRef = useRef(false);

  const { searchCols = [], orderBy, filters = {} } = options;

  // Compute pagination range for Supabase (inclusive indices)
  const range = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return { from, to };
  }, [page, pageSize]);

  useEffect(() => {
    let aborted = false; // soft abort; Supabase client doesn't support AbortController on queries
    if (!fetchedRef.current) fetchedRef.current = true; // first-mount guard (Strict Mode safe)

    async function run() {
      setLoading(true);
      setError(undefined);

      // base query with exact count for pagination
      let query = supabase.from(table).select('*', { count: 'exact' });

      // fixed filters
      for (const [k, v] of Object.entries(filters)) {
        if (v === null) query = query.is(k, null);
        else query = query.eq(k, v as any);
      }

      // search across multiple columns via OR
      if (search && searchCols.length) {
        const orParts = searchCols.map((c) => `${c}.ilike.%${search}%`);
        query = query.or(orParts.join(','));
      }

      // ordering
      if (orderBy) {
        const [col, opts] = orderBy;
        query = query.order(col, { ascending: opts?.ascending ?? true });
      }

      // pagination
      query = query.range(range.from, range.to);

      const { data, error, count } = await query;
      if (aborted) return;

      if (error) {
        setError(error.message);
        setRows([]);
        setTotal(0);
      } else {
        setRows((data ?? []) as T[]);
        setTotal(count ?? 0);
      }

      setLoading(false);
    }

    run();
    return () => { aborted = true; };
  // stringifying filters keeps deps stable without deep compare libs
  }, [table, page, pageSize, search, JSON.stringify(filters), orderBy?.[0], orderBy?.[1]?.ascending, range.from, range.to, refreshKey.current]);

  function refresh() { refreshKey.current++; }

  return { loading, error, rows, page, pageSize, total, setPage, setSearch, refresh };
}
