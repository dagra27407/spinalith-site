/**
 * BeatDetailView (v1.1 — schema-aligned)
 *
 * Plain-English: Read-only page for a single Beat, showing all fields with the
 * same field-hover tooltip + inline helper pattern as editors.
 *
 * Route:
 *  /projects/:projectId/story-arcs/:arcId/beats/:beatId
 */
/**
 * BeatDetailView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Read-only page for a single Beat.
 * This update ONLY changes layout/styling classes to use our shared
 * utilities/tokens from index.css. No logic, data, or routing changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius (for shells)
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useRow } from '@/lib/data/useRow';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormCard } from '@/components/ui/FormCard';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

// COLUMN MAP — aligned to your schema
const COL = {
  id: 'beat_id',
  projectId: 'narrative_project_id',
  arcId: 'story_arc',
  name: 'beat_name',
  summary: 'beat_summary',
  type: 'beat_type',
  purpose: 'beat_purpose',
} as const;

interface BeatRow {
  [COL.id]: string;
  [COL.projectId]: string;
  [COL.arcId]: string;
  [COL.name]: string | null;
  [COL.summary]: string | null;
  [COL.type]: string | null;
  [COL.purpose]: string | null;
}

function ReadOnlyField({ htmlFor, label, hint, value }: { htmlFor: string; label: string; hint: string; value: any }) {
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Use consistent gaps; keep the muted inline display */}
        <div className="flex flex-col app-gap">
          <div className="flex items-center app-gap">
            <Label htmlFor={htmlFor}>{label}</Label>
            <Info className="w-3 h-4 text-muted-foreground cursor-help" />
          </div>
          <div className="flex items-center app-gap text-muted-foreground text-xs">
            <Info className="w-3 h-3" /> {hint}
          </div>
          <div id={htmlFor} className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            {display}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom"><p>{hint}</p></TooltipContent>
    </Tooltip>
  );
}

export default function BeatDetailView() {
  const { projectId, arcId, beatId } = useParams();
  const navigate = useNavigate();
  
  const { row, loading, error } = useRow<BeatRow>('story_arc_beats', beatId, { idColumn: COL.id });

  const baseUrl = `/projects/${projectId}/story-arcs/${arcId}/beats`;
  const arcUrl  = `/projects/${projectId}/story-arcs/${arcId}`;

  // Loading / error shells with consistent radius
  if (loading) return <Card className="app-card-radius p-6">Loading…</Card>;
  if (error || !row) return <Card className="app-card-radius p-6 text-destructive">Beat not found.</Card>;

  return (
    <TooltipProvider>
      <div className="app-page space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between app-gap">
          <h1 className="app-h1">Beat</h1>
          <div className="flex app-gap">
            <Button variant="secondary" onClick={() => navigate(arcUrl)}>Back</Button>
            <Button onClick={() => navigate(`${baseUrl}/${(row as any)[COL.id]}/edit`)}>Edit</Button>
          </div>
        </div>

        {/* Details */}
        <FormCard title="Beat" description="Atomic story moment within an arc.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <ReadOnlyField htmlFor="name" label="Title" hint="Short handle for this beat." value={(row as any)[COL.name]} />
            <ReadOnlyField htmlFor="type" label="Type" hint="Optional category (e.g., inciting, midpoint, twist)." value={(row as any)[COL.type]} />
            <ReadOnlyField htmlFor="purpose" label="Purpose" hint="Why this beat exists / what it accomplishes." value={(row as any)[COL.purpose]} />
            <div className="md:col-span-2">
              <ReadOnlyField htmlFor="summary" label="Summary" hint="One or two sentences describing what happens." value={(row as any)[COL.summary]} />
            </div>
          </div>
        </FormCard>
      </div>
    </TooltipProvider>
  );
}
