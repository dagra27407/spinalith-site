/**
 * BeatsHubView (v1.1 — project-level hub, passes router state)
 *
 * Dedicated page focused on Beats, scoped to one project.
 * Route: /projects/:projectId/beats
 * - Lists all arcs (expandable card per arc)
 * - Each arc card: View Arc / Open Beats / New Beat
 * - Expands to preview a compact, read-only list of that arc’s beats
 * - Adds router state { from: "beats-hub" } so ArcDetailView can send Back to this hub
 */
/**
 * BeatsHubView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Project-level hub for Beats. This update ONLY
 * changes layout/styling classes to our shared utilities/tokens. No logic,
 * data, or routing changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap (kept a few tight internals where appropriate)
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius (search, rows, mini-list items)
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTableList } from '@/lib/data/useTableList';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

/** Story Arc shape */
interface ArcRow {
  story_arc_id: string;
  narrative_project_id: string;
  arc_name: string | null;
  arc_type: string | null;
  arc_level: string | null; // Minor | Mid-Range | Major
  arc_description: string | null;
}

/** Beat shape */
const BEAT_COL = {
  id: 'beat_id',
  projectId: 'narrative_project_id',
  arcId: 'story_arc',
  name: 'beat_name',
  summary: 'beat_summary',
  type: 'beat_type',
  purpose: 'beat_purpose',
  createdAt: 'created_at',
} as const;

interface BeatRow {
  [BEAT_COL.id]: string;
  [BEAT_COL.projectId]: string;
  [BEAT_COL.arcId]: string; // uuid
  [BEAT_COL.name]: string | null;
  [BEAT_COL.summary]: string | null;
  [BEAT_COL.type]: string | null;
  [BEAT_COL.purpose]: string | null;
  [BEAT_COL.createdAt]: string;
}

function BeatsMiniList({ projectId, arcId, search }: { projectId: string; arcId: string; search: string }) {
  const navigate = useNavigate();
  const list = useTableList<BeatRow>('story_arc_beats', {
    filters: { [BEAT_COL.projectId]: projectId, [BEAT_COL.arcId]: arcId },
    searchCols: [BEAT_COL.name, BEAT_COL.summary, BEAT_COL.purpose, BEAT_COL.type],
    orderBy: [BEAT_COL.createdAt, { ascending: true }],
    pageSize: 5,
  });

  // pass hub search down
  const [applied, setApplied] = useState('');
  if (search !== applied) {
    setApplied(search);
    list.setSearch(search);
  }

  if (list.loading) {
    return (
      <div className="space-y-2 mt-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!list.loading && list.rows.length === 0) {
    return <div className="text-sm text-muted-foreground mt-2">No beats yet.</div>;
  }

  return (
    <div className="space-y-2 mt-3">
      {list.rows.map((r) => (
        <Card key={r[BEAT_COL.id]} className="app-card-radius p-3 flex items-center app-gap">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{r[BEAT_COL.name] ?? '—'}</div>
            <div className="text-xs text-muted-foreground truncate">{r[BEAT_COL.summary] ?? '—'}</div>
            <div className="text-xs text-muted-foreground truncate">
              {r[BEAT_COL.type] ? `Type: ${r[BEAT_COL.type]}` : 'Type: —'} · {r[BEAT_COL.purpose] ? `Purpose: ${r[BEAT_COL.purpose]}` : 'Purpose: —'}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              navigate(`/projects/${projectId}/story-arcs/${arcId}/beats/${r[BEAT_COL.id]}`, {
                state: { from: 'beats-hub' },
              })
            }
          >
            View
          </Button>
        </Card>
      ))}
    </div>
  );
}

export default function BeatsHubView() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const pid = projectId ?? '';

  const [search, setSearch] = useState('');

  const arcs = useTableList<ArcRow>('story_arcs', {
    filters: { narrative_project_id: pid },
    searchCols: ['arc_name', 'arc_description', 'arc_type'],
    orderBy: ['arc_name', { ascending: true }],
    pageSize: 50,
  });

  // push search into the arcs list (server-side search)
  const [applied, setApplied] = useState('');
  if (search !== applied) {
    setApplied(search);
    arcs.setSearch(search);
  }

  const empty = useMemo(() => !arcs.loading && arcs.rows.length === 0, [arcs.loading, arcs.rows.length]);

  return (
    <div className="app-page space-y-6">
      <div className="flex items-center justify-between app-gap">
        <div>
          <h1 className="app-h1">Beats</h1>
          <p className="text-sm text-muted-foreground">Pick an arc to focus beats, or create new ones directly under an arc.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/projects/${pid}`)}>Back to Project</Button>
      </div>

      <Card className="app-card-radius p-4">
        <div className="flex items-center app-gap">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search arcs and beats…"
            className="max-w-sm"
          />
          <div className="ml-auto text-sm text-muted-foreground">{arcs.total} arcs</div>
        </div>
      </Card>

      {!projectId ? (
        <Card className="app-card-radius p-6 text-muted-foreground">Select a project first.</Card>
      ) : arcs.loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : empty ? (
        <Card className="app-card-radius p-6 text-center text-muted-foreground">
          No arcs yet. Create an arc to unlock beats.
          <div className="mt-3">
            <Button onClick={() => navigate(`/projects/${pid}/story-arcs/new`)}>New Arc</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {arcs.rows.map((a) => (
            <ArcHubCard key={a.story_arc_id} arc={a} projectId={pid} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArcHubCard({ arc, projectId, search }: { arc: ArcRow; projectId: string; search: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <Card className="app-card-radius p-4">
      <div className="flex items-start justify-between app-gap">
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{arc.arc_name ?? '—'}</div>
          <div className="text-sm text-muted-foreground truncate">{arc.arc_description ?? '—'}</div>
          <div className="text-xs text-muted-foreground truncate">
            {arc.arc_level ? `Level: ${arc.arc_level}` : 'Level: —'}
            {arc.arc_type ? ` · Type: ${arc.arc_type}` : ''}
          </div>
        </div>
        <div className="flex items-center app-gap">
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/projects/${projectId}/story-arcs/${arc.story_arc_id}`, {
                state: { from: 'beats-hub' },
              })
            }
          >
            View Arc
          </Button>
          <Button
            onClick={() =>
              navigate(`/projects/${projectId}/story-arcs/${arc.story_arc_id}/beats`, {
                state: { from: 'beats-hub' },
              })
            }
          >
            Open Beats
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/projects/${projectId}/story-arcs/${arc.story_arc_id}/beats/new`, {
                state: { from: 'beats-hub' },
              })
            }
          >
            New Beat
          </Button>
          <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
            {open ? 'Hide' : 'Preview'}
          </Button>
        </div>
      </div>

      {open && <BeatsMiniList projectId={projectId} arcId={arc.story_arc_id} search={search} />}
    </Card>
  );
}
