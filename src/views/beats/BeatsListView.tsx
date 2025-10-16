/**
 * BeatsListView (v1.2a — embedded mode + absolute navigation)
 *
 * Lists beats for a specific Arc. Works as a full page and embedded panel.
 * - Route params: :projectId, :arcId (UUIDs)
 * - Table: story_arc_beats
 * - Columns: beat_name, beat_summary, beat_type, beat_purpose, story_arc (uuid)
 * - Filtering: by narrative_project_id + story_arc
 * - Ordering: created_at (no beat_order column)
 * - NEW: `embedded` prop for compact header
 * - FIX: all navigate() calls now use absolute `base` path so embedding works
 */
/**
 * BeatsListView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Lists beats for a specific Arc. Works as a full
 * page and as an embedded panel. This update ONLY changes layout/styling
 * classes to use our shared utilities/tokens. No logic, data, or routing
 * changes.
 *
 * What changed (class-level only):
 *  - Full page padding → .app-page (embedded stays compact)
 *  - Row gaps          → .app-gap
 *  - Title style       → .app-h1 (full page only)
 *  - Card corners      → .app-card-radius (toolbars, rows, empty shells)
 */

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTableList } from "@/lib/data/useTableList";
import { useMutations } from "@/lib/data/useMutations";
import { useRow } from "@/lib/data/useRow";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
// import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

/** COLUMN MAP — aligned to your schema */
const COL = {
  id: "beat_id",
  projectId: "narrative_project_id",
  arcId: "story_arc", // UUID of parent arc
  name: "beat_name",
  summary: "beat_summary",
  type: "beat_type",
  purpose: "beat_purpose",
  createdAt: "created_at",
} as const;

interface BeatRow {
  [COL.id]: string;
  [COL.projectId]: string;
  [COL.arcId]: string; // uuid
  [COL.name]: string | null;
  [COL.summary]: string | null;
  [COL.type]: string | null;
  [COL.purpose]: string | null;
  [COL.createdAt]: string;
}

interface ArcRow {
  story_arc_id: string;
  arc_name: string | null;
}

type BeatsListViewProps = { embedded?: boolean };

export default function BeatsListView({ embedded = false }: BeatsListViewProps) {
  const navigate = useNavigate();
  const { projectId, arcId } = useParams();

  const inScope = !!projectId && !!arcId;

  // Parent arc name for context (shown only in full-page header)
  const { row: arcRow } = useRow<ArcRow>("story_arcs", arcId, {
    idColumn: "story_arc_id",
  });

  const list = useTableList<BeatRow>("story_arc_beats", {
    filters: { [COL.projectId]: projectId ?? "", [COL.arcId]: arcId ?? "" },
    searchCols: [COL.name, COL.summary, COL.purpose, COL.type],
    orderBy: [COL.createdAt, { ascending: true }],
    pageSize: 10,
  });

  const { remove } = useMutations("story_arc_beats");

  const empty = useMemo(
    () => !list.loading && list.rows.length === 0,
    [list.loading, list.rows.length]
  );

  // Absolute base so navigation is correct when embedded
  const base = `/projects/${projectId}/story-arcs/${arcId}/beats`;

  // Wrapper: full page gets standardized padding; embedded stays tight
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={embedded ? "space-y-4" : "app-page space-y-6"}>{children}</div>
  );

  return (
    <Wrapper>
      {/* Full-page header */}
      {!embedded && (
        <div className="flex items-center justify-between app-gap">
          <div>
            <h1 className="app-h1">
              Beats{arcRow?.arc_name ? ` for: ${arcRow.arc_name}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Atomic moments within this arc.
            </p>
          </div>
          <Button onClick={() => navigate(`${base}/new`)} disabled={!inScope}>
            New Beat
          </Button>
        </div>
      )}

      {/* Compact toolbar for embedded mode */}
      {embedded && (
        <div className="flex items-center justify-between app-gap">
          <div className="text-sm font-medium">Beats</div>
          <Button size="sm" onClick={() => navigate(`${base}/new`)} disabled={!inScope}>
            New
          </Button>
        </div>
      )}

      {!inScope ? (
        <Card className="app-card-radius p-6 text-muted-foreground">
          Open a project & arc first to view beats.
        </Card>
      ) : (
        <>
          <Card className="app-card-radius p-4">
            <div className="flex items-center app-gap">
              <Input
                placeholder="Search beats…"
                onChange={(e) => list.setSearch(e.target.value)}
                className="max-w-sm"
              />
              <div className="ml-auto text-sm text-muted-foreground">
                {list.total} total
              </div>
            </div>
          </Card>

          {list.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : empty ? (
            <Card className="app-card-radius p-6 text-center text-muted-foreground">
              No beats yet. Create your first one.
            </Card>
          ) : (
            <div className="space-y-2">
              {list.rows.map((r) => (
                <Card key={r[COL.id]} className="app-card-radius p-4 flex items-center app-gap">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r[COL.name] ?? "—"}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {r[COL.summary] ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {r[COL.type] ? `Type: ${r[COL.type]}` : "Type: —"} · {r[COL.purpose] ? `Purpose: ${r[COL.purpose]}` : "Purpose: —"}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => navigate(`${base}/${r[COL.id]}`)}>
                    View
                  </Button>
                  {/**
                   * Optional actions we had commented out remain the same; their variants
                   * are already token-driven if you re-enable them.
                   *
                   * <Button variant="ghost" onClick={() => navigate(`${base}/${r[COL.id]}/edit`)}>Edit</Button>
                   * <ConfirmDialog
                   *   onConfirm={async () => {
                   *     const res = await remove(r[COL.id], COL.id);
                   *     if (res.ok) list.refresh();
                   *     else window.alert(`Delete failed: ${res.error}`);
                   *   }}
                   *   trigger={<Button variant="destructive">Delete</Button>}
                   *   title="Delete beat?"
                   *   description={`This will permanently delete "${r[COL.name] ?? ''}".`}
                   * />
                   */}
                </Card>
              ))}
            </div>
          )}

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

          {list.error ? (
            <div className="text-destructive text-sm">{list.error}</div>
          ) : null}
        </>
      )}
    </Wrapper>
  );
}
