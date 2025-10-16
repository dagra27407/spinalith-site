/**
 * ArcEditView
 *
 * Plain-English: Page to **create or edit** a Story Arc.
 * - If the URL is `/arcs/new`, this is a blank form to create an arc.
 * - If the URL has an `:arcId`, it loads that arc and lets you edit it.
 *
 * What it does:
 * - Reads `projectId` from your store (required to create a new arc).
 * - Uses `useRow('story_arcs', arcId)` to load the existing arc when editing.
 * - Uses `useMutations('story_arcs')` to save (insert/upsert).
 * - Validates required fields (title + projectId) and disables Save when invalid.
 * - After saving, navigates back to the arcs list.
 *
 * Routing expectations:
 *   - `/projects/:projectId/arcs/new` → create mode
 *   - `/projects/:projectId/arcs/:arcId/edit` → edit mode
 */

/**
 * ArcEditView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Create/Edit a Story Arc. This commit ONLY updates
 * layout/styling classes to use our project-wide tokens/utilities. No logic,
 * routing, or data flow changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page (from index.css)
 *  - Row gaps       → .app-gap
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius (for lightweight shells)
 *  - Kept shadcn variants (default/secondary/destructive) — no manual colors
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRow } from '@/lib/data/useRow';
import { useMutations } from '@/lib/data/useMutations';

import { FormCard } from '@/components/ui/FormCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Info, Trash2 } from 'lucide-react';

// Table + columns for story_arcs
interface ArcRow {
  story_arc_id: string;
  narrative_project_id: string;
  arc_name: string | null;
  arc_type: string | null;
  arc_level: string | null; // Minor | Mid-Range | Major
  arc_description: string | null;
  arc_resolution: string | null;
  conflict_potential: string | null;
}

function FieldWithTooltip({ htmlFor, label, hint, children }: { htmlFor: string; label: string; hint: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col app-gap">
          <div className="flex items-center app-gap">
            <Label htmlFor={htmlFor}>{label}</Label>
            <Info className="w-3 h-4 text-muted-foreground cursor-help" />
          </div>
          <div className="flex items-center app-gap text-muted-foreground text-xs">
            <Info className="w-3 h-3" /> {hint}
          </div>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom"><p>{hint}</p></TooltipContent>
    </Tooltip>
  );
}

export default function ArcEditView() {
  const navigate = useNavigate();
  const { projectId, arcId } = useParams();

  const isCreate = !arcId || arcId === 'new';

  // Destinations
  const arcsListUrl = `/projects/${projectId}/story-arcs`;
  const arcDetailUrl = `/projects/${projectId}/story-arcs/${arcId}`;
  const cancelHref = isCreate ? arcsListUrl : arcDetailUrl;

  const { row, loading, error } = useRow<ArcRow>('story_arcs', isCreate ? undefined : arcId, { idColumn: 'story_arc_id' });
  const { insert, upsert, remove, loading: saving, error: saveError } = useMutations('story_arcs');

  // Form state
  const [name, setName] = useState('');
  const [level, setLevel] = useState(''); // Minor | Mid-Range | Major
  const [type, setType] = useState('');
  const [summary, setSummary] = useState('');
  const [resolution, setResolution] = useState('');
  const [conflict, setConflict] = useState('');

  // Hydrate for edit
  useEffect(() => {
    if (!row) return;
    setName(row.arc_name ?? '');
    setType(row.arc_type ?? '');
    setLevel(row.arc_level ?? '');
    setSummary(row.arc_description ?? '');
    setResolution(row.arc_resolution ?? '');
    setConflict(row.conflict_potential ?? '');
  }, [row]);

  const requiredMissing = !name.trim();

  async function onSubmit() {
    const payload = {
      narrative_project_id: projectId!,
      arc_name: name.trim(),
      arc_type: type.trim() || null,
      arc_level: level || null,
      arc_description: summary.trim() || null,
      arc_resolution: resolution.trim() || null,
      conflict_potential: conflict.trim() || null,
    } as const;

    if (isCreate) {
      const res = await insert<ArcRow>(payload as any);
      if (res.ok) {
        // Keep it simple: return to list; (we can deep-link to new arc detail if insert returns id)
        navigate(arcsListUrl);
      }
      return;
    }

    const res = await upsert<ArcRow>({ ...(payload as any), story_arc_id: arcId! } as any, 'story_arc_id');
    if (res.ok) navigate(arcDetailUrl);
  }

  // Lightweight shells for loading/error (radius aligned)
  if (!isCreate && loading) return <Card className="app-card-radius p-6">Loading…</Card>;
  if (!isCreate && (error || !row)) return <Card className="app-card-radius p-6 text-destructive">Arc not found.</Card>;

  return (
    <TooltipProvider>
      <div className="app-page space-y-6">
        <div className="flex items-center justify-between app-gap">
          <h1 className="app-h1">{isCreate ? 'New Arc' : 'Edit Arc'}</h1>
          <Button variant="secondary" onClick={() => navigate(cancelHref)}>
            {isCreate ? 'Back to Arcs' : 'Back to Arc'}
          </Button>
        </div>

        <FormCard title="Basics" description="High-level identity of this arc.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <FieldWithTooltip htmlFor="name" label="Title" hint="Name for this arc (e.g., The Heist)">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., The Heist" />
              <p className="text-xs text-muted-foreground mt-1">Required</p>
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="level" label="Arc Level" hint="Narrative weight of this arc: Minor, Mid-Range, or Major.">
              <select
                id="level"
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="">— Select level —</option>
                <option value="Minor">Minor</option>
                <option value="Mid-Range">Mid-Range</option>
                <option value="Major">Major</option>
              </select>
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="type" label="Arc Type" hint="Optional categorization (e.g., Romance, Revenge, Redemption)">
              <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Redemption" />
            </FieldWithTooltip>

            <div className="md:col-span-2">
              <FieldWithTooltip htmlFor="summary" label="Summary" hint="One or two sentences describing this arc.">
                <Textarea id="summary" rows={5} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Overview of the arc" />
              </FieldWithTooltip>
            </div>
          </div>
        </FormCard>

        <FormCard title="Conflict & Resolution" description="Where it leads and what stands in the way.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <div className="md:col-span-1">
              <FieldWithTooltip htmlFor="conflict" label="Conflict Potential" hint="Antagonistic forces, obstacles, and stakes raised by this arc.">
                <Textarea id="conflict" rows={4} value={conflict} onChange={(e) => setConflict(e.target.value)} placeholder="What pressure does this arc apply?" />
              </FieldWithTooltip>
            </div>
            <div className="md:col-span-1">
              <FieldWithTooltip htmlFor="resolution" label="Arc Resolution" hint="How the arc resolves or transforms by the end.">
                <Textarea id="resolution" rows={4} value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="What is the outcome of this arc?" />
              </FieldWithTooltip>
            </div>
          </div>
        </FormCard>

        <div className="flex justify-end app-gap pt-2">
          <Button variant="secondary" onClick={() => navigate(cancelHref)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving || requiredMissing}>
            {saving ? 'Saving…' : isCreate ? 'Create Arc' : 'Save Changes'}
          </Button>
        </div>

        {/* Danger Zone — only in EDIT mode */}
        {!isCreate && (
          <Card className="app-card-radius p-4 border-destructive/40 mt-6">
            <div className="text-sm font-semibold text-destructive">Danger Zone</div>
            <p className="text-sm text-muted-foreground">Deleting an arc is permanent and may remove its beats.</p>
            <div className="mt-3">
              <ConfirmDialog
                title="Delete arc?"
                description="This will permanently delete this arc and its beats."
                trigger={
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Arc
                  </Button>
                }
                onConfirm={async () => {
                  const res = await remove(arcId!, 'story_arc_id');
                  if (res.ok) navigate(arcsListUrl);
                  else window.alert(`Delete failed: ${res.error}`);
                }}
              />
            </div>
          </Card>
        )}

        {saveError ? <div className="text-destructive text-sm mt-2">{saveError}</div> : null}
      </div>
    </TooltipProvider>
  );
}
