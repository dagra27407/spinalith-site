/**
 * ProjectsListView
 *
 * Plain-English: A clean list of all Narrative Projects with search, paging,
 * and quick actions (View, Edit, Delete, New). Mirrors the Arcs list UX.
 *
 * Why: We previously had a one-off Create form (Zustand-based) fileciteturn1file0.
 * This list brings the projects flow in line with the Arcs pattern (our new standard):
 *   - Server-backed list (no client cache),
 *   - Search (title/summary),
 *   - New → /projects/new, View → /projects/:projectId (your dashboard),
 *   - Edit → /projects/:projectId/edit, Delete → RLS-safe remove + refresh.
 *
 * Routing expectations (recommended):
 *   /projects                    → <ProjectsListView /> (index)
 *   /projects/new                → <ProjectEditView />  (create)
 *   /projects/:projectId         → <MainProjectView />  (your existing dashboard)
 *   /projects/:projectId/edit    → <ProjectEditView />  (edit)
 */

/**
 * ProjectsListView (snap-to-standards pass)
 *
 * Plain-English (2am-you): List all Narrative Projects with search, paging,
 * and quick actions (View, Edit, Delete, New).
 *
 * This update ONLY changes layout/styling classes to our shared utilities
 * and token-driven shadcn variants. No logic, data, or routing changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius (toolbar, rows, empty shell)
 */

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTableList } from '@/lib/data/useTableList';
import { useMutations } from '@/lib/data/useMutations';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ProjectRow {
  id: string;
  title: string | null;
  story_summary: string | null;
  format: string | null;
  intended_audience: string | null;
  created_at?: string | null;
}

export default function ProjectsListView() {
  const navigate = useNavigate();
  // If mounted under nested routes, keep params optional
  const { projectId } = useParams();

  const list = useTableList<ProjectRow>('narrative_projects', {
    searchCols: ['title', 'story_summary', 'format'],
    orderBy: ['created_at', { ascending: false }],
    pageSize: 10,
  });

  const { remove } = useMutations('narrative_projects');

  const empty = useMemo(
    () => !list.loading && list.rows.length === 0,
    [list.loading, list.rows.length]
  );

  return (
    <div className="app-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between app-gap">
        <div>
          <h1 className="app-h1">Projects</h1>
          <p className="text-sm text-muted-foreground">All narrative projects in your account.</p>
        </div>
        <Button onClick={() => navigate('new')}>New Project</Button>
      </div>

      {/* Search toolbar */}
      <Card className="app-card-radius p-4">
        <div className="flex items-center app-gap">
          <Input
            placeholder="Search projects…"
            onChange={(e) => list.setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="ml-auto text-sm text-muted-foreground">{list.total} total</div>
        </div>
      </Card>

      {/* Loading / Empty / List */}
      {list.loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : empty ? (
        <Card className="app-card-radius p-6 text-center text-muted-foreground">
          No projects yet. Create your first one.
        </Card>
      ) : (
        <div className="space-y-2">
          {list.rows.map((p) => (
            <Card key={p.id} className="app-card-radius p-4 flex items-center app-gap">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.title ?? '—'}</div>
                <div className="text-sm text-muted-foreground truncate">{p.story_summary ?? '—'}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.format ? `Format: ${p.format}` : 'Format: —'} · {p.intended_audience ? `Audience: ${p.intended_audience}` : 'Audience: —'}
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate(p.id)}>View</Button>
              <Button variant="ghost" onClick={() => navigate(`${p.id}/edit`)}>Edit</Button>
              <ConfirmDialog
                onConfirm={async () => {
                  const res = await remove(p.id, 'id');
                  if (res.ok) list.refresh();
                  else window.alert(`Delete failed: ${res.error}`);
                }}
                trigger={<Button variant="destructive">Delete</Button>}
                title="Delete project?"
                description={`This will permanently delete "${p.title ?? ''}".`}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Pager */}
      <div className="flex items-center justify-end app-gap">
        <Button
          variant="secondary"
          disabled={list.page <= 1}
          onClick={() => list.setPage(list.page - 1)}
        >
          Prev
        </Button>
        <div className="text-sm">Page {list.page}</div>
        <Button variant="secondary" onClick={() => list.setPage(list.page + 1)}>
          Next
        </Button>
      </div>

      {list.error ? <div className="text-destructive text-sm">{list.error}</div> : null}
    </div>
  );
}
