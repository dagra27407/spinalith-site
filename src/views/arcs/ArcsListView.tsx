/**
 * ArcsListView
 *
 * Plain-English: Page that shows a **list of Story Arcs** for the currently selected project.
 * It lets you:
 *   - Search arcs by title/summary
 *   - See a paginated list
 *   - Create a new arc
 *   - Jump to View / Edit
 *   - Delete an arc (with confirm dialog)
 *
 * How it works:
 *   - Reads `projectId` from your store (useNarrativeProjectStore)
 *   - Uses `useTableList('story_arcs', { filters: { narrative_project_id: projectId } })`
 *   - Uses `useMutations('story_arcs')` for deletions
 *   - Simple pager (Prev/Next)
 *
 * Routing expectations:
 *   - Mounted under something like: /projects/:projectId/arcs
 *   - "New" navigates to       : /projects/:projectId/arcs/new
 *   - Row "View" navigates to  : /projects/:projectId/arcs/:arcId
 *   - Row "Edit" navigates to  : /projects/:projectId/arcs/:arcId/edit
 */

/**
 * ArcsListView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Read-only list of Story Arcs for the current project.
 * This update ONLY changes layout/styling classes to use our shared utilities
 * and token-driven shadcn variants. No logic, data, or routing changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius (list/search/empty shells)
 *  - Borders/colors → rely on token utilities (text-muted-foreground, etc.)
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

interface ArcRow {
  story_arc_id: string;
  narrative_project_id: string;
  arc_name: string | null;
  arc_type: string | null;
  arc_level: string | null;
  arc_description: string | null;
  arc_resolution: string | null;
  conflict_potential: string | null;
}

export default function ArcsListView() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const projectSelected = !!projectId;

  const list = useTableList<ArcRow>('story_arcs', {
    filters: { narrative_project_id: projectId ?? '' },
    searchCols: ['arc_name', 'arc_description'],
    orderBy: ['arc_level', { ascending: true }],
    pageSize: 10,
  });

  const { remove } = useMutations('story_arcs');

  const empty = useMemo(() => !list.loading && list.rows.length === 0, [list.loading, list.rows.length]);

  return (
    // Standardized page padding + vertical rhythm
    <div className="app-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between app-gap">
      <div>
        <h1 className="app-h1">Story Arcs</h1>
        <p className="text-sm text-muted-foreground">All arcs for the current project.</p>
      </div>

      {/* ← replace existing single New button with this block */}
      <div className="flex app-gap">
        <Button
          variant="secondary"
          onClick={() => projectId && navigate(`/projects/${projectId}`)}
        >
          Back to Project
        </Button>
        <Button onClick={() => navigate('new')} disabled={!projectSelected}>
          New Arc
        </Button>
      </div>
    </div>


      {!projectSelected ? (
        <Card className="app-card-radius p-6 text-muted-foreground">Select a project first to view its arcs.</Card>
      ) : (
        <>
          {/* Search bar / total count */}
          <Card className="app-card-radius p-4">
            <div className="flex items-center app-gap">
              <Input
                placeholder="Search arcs…"
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
            <Card className="app-card-radius p-6 text-center text-muted-foreground">No arcs yet. Create your first one.</Card>
          ) : (
            <div className="space-y-2">
              {list.rows.map((r) => (
                <Card key={r.story_arc_id} className="app-card-radius p-4 flex items-center app-gap">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.arc_name ?? '—'}</div>
                    <div className="text-sm text-muted-foreground truncate">{r.arc_description ?? '—'}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {r.arc_level ? `Level: ${r.arc_level}` : 'Level: —'} · {r.conflict_potential ? `Conflict: ${r.conflict_potential}` : 'Conflict: —'}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => navigate(r.story_arc_id)}>View</Button>
                  {/**
                   * You can re-enable these when ready; variants are already token-driven.
                   * <Button variant="ghost" onClick={() => navigate(`${r.story_arc_id}/edit`)}>Edit</Button>
                   * <Button variant="outline" onClick={() => navigate(`${r.story_arc_id}/beats`)}>Beats</Button>
                   * <ConfirmDialog
                   *   onConfirm={async () => {
                   *     const res = await remove(r.story_arc_id, 'story_arc_id');
                   *     if (res.ok) list.refresh(); else window.alert(`Delete failed: ${res.error}`);
                   *   }}
                   *   trigger={<Button variant="destructive">Delete</Button>}
                   *   title="Delete arc?"
                   *   description={`This will permanently delete "${r.arc_name ?? ''}".`}
                   * />
                   */}
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
        </>
      )}
    </div>
  );
}
