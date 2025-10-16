/**
 * ProjectDetailView (v1.0 — read-only, full fields)
 *
 * Plain-English: A linkable, **read-only** page that shows **all** project fields
 * (parity with ProjectEditView) grouped into the same sections. It uses
 * field-hover tooltips **and** keeps inline helpers, just like the editor.
 *
 * Route suggestion:
 *   /projects/:projectId/details
 *
 * UX:
 *  - Top bar with Back and Edit buttons.
 *  - Each field is displayed as static text. If a value is empty, shows "—".
 *  - Hovering anywhere over a field block shows the tooltip.
 */

/**
 * ProjectDetailView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Read-only page showing **all** fields for a project.
 * This update ONLY tweaks layout/styling classes to our project-wide
 * utilities/tokens. No logic, routing, or data changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius for loading/error shells
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useRow } from '@/lib/data/useRow';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormCard } from '@/components/ui/FormCard';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface ProjectRow {
  id: string;
  title: string | null;
  tone: string | null;
  core_themes: string | null;
  story_summary: string | null;
  format: string | null;
  format_intent: string | null;
  episode_or_chapter: string | null;
  episode_chapter_count: number | null;
  hard_chapter_limit: boolean | null;
  intended_audience: string | null;
  content_restrictions: string | null;
  genre_tags: string | null;
  world_context: string | null;
  central_conflict_goal: string | null;
  structural_notes: string | null;
  reference_works: string | null;
  episodic_structure: string | null;
}

/**
 * ReadOnlyFieldWithTooltip
 * Wraps a read-only field (label + helper + value) with a tooltip trigger.
 * Uses token-driven colors (no hard-coded grays), and a subtle muted field bg.
 */
function ReadOnlyFieldWithTooltip({
  htmlFor,
  label,
  hint,
  value,
  mono = false,
}: {
  htmlFor: string;
  label: string;
  hint: string;
  value: string | number | null | undefined | boolean;
  mono?: boolean;
}) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? (value ? 'Yes' : 'No')
      : String(value);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label htmlFor={htmlFor}>{label}</Label>
            <Info className="w-3 h-4 text-muted-foreground cursor-help" />
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Info className="w-3 h-3" /> {hint}
          </div>
          <div
            id={htmlFor}
            className={
              'rounded-md border bg-muted/40 px-3 py-2 text-sm ' +
              (mono ? 'font-mono' : '')
            }
          >
            {display}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{hint}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function ProjectDetailView() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { row, loading, error } = useRow<ProjectRow>('narrative_projects', projectId);

  // Loading / error shells snap to our radius
  if (loading) return <Card className="app-card-radius p-6">Loading…</Card>;
  if (error || !row) return <Card className="app-card-radius p-6 text-destructive">Project not found.</Card>;

  return (
    <TooltipProvider>
      <div className="app-page space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between app-gap">
          <h1 className="app-h1">Project Overview</h1>
          <div className="flex app-gap">
            <Button variant="secondary" onClick={() => projectId && navigate(`/projects/${projectId}`)}>Back</Button>
            <Button onClick={() => projectId && navigate(`/projects/${projectId}/edit`)}>Edit</Button>
          </div>
        </div>

        {/* Story Overview */}
        <FormCard title="Story Overview" description="Creative tone and the core concept.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <ReadOnlyFieldWithTooltip htmlFor="title" label="Title" hint="The name of your book or series." value={row.title} />
            <ReadOnlyFieldWithTooltip htmlFor="tone" label="Tone" hint="Emotional feel or atmosphere (e.g., dark, hopeful)." value={row.tone} />
            <ReadOnlyFieldWithTooltip htmlFor="coreThemes" label="Core Themes" hint="Concepts explored — e.g., redemption, betrayal." value={row.core_themes} />
            <div className="md:col-span-2">
              <ReadOnlyFieldWithTooltip htmlFor="summary" label="Story Summary" hint="Short paragraph describing your story’s premise." value={row.story_summary} />
            </div>
          </div>
        </FormCard>

        {/* Structural Intent */}
        <FormCard title="Structural Intent" description="How the story is delivered and organized.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <ReadOnlyFieldWithTooltip htmlFor="format" label="Format" hint="The container: Novel, Serial, Script, etc." value={row.format} />
            <ReadOnlyFieldWithTooltip htmlFor="formatIntent" label="Format Intent" hint="Why this format fits your goals." value={row.format_intent} />
            <ReadOnlyFieldWithTooltip htmlFor="episodeOrChapter" label="Story Units" hint="How you break up your story." value={row.episode_or_chapter} />
            <ReadOnlyFieldWithTooltip htmlFor="episodeChapterCount" label="Episode/Chapter Count" hint="Expected number of installments." value={row.episode_chapter_count ?? '—'} />
            <ReadOnlyFieldWithTooltip htmlFor="hardChapterLimit" label="Hard Chapter Limit?" hint="If checked, keep to the exact count above." value={!!row.hard_chapter_limit} />
          </div>
        </FormCard>

        {/* Audience & Boundaries */}
        <FormCard title="Audience & Boundaries" description="Who is this for, and what should we know?">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <ReadOnlyFieldWithTooltip htmlFor="audience" label="Intended Audience" hint="Who the story is aimed at." value={row.intended_audience} />
            <ReadOnlyFieldWithTooltip htmlFor="contentRestrictions" label="Content Restrictions" hint="Boundaries to observe: no gore, PG-13, etc." value={row.content_restrictions} />
            <div className="md:col-span-2">
              <ReadOnlyFieldWithTooltip htmlFor="genreTags" label="Genre Tags" hint="Comma-separated genres/subgenres." value={row.genre_tags} mono />
            </div>
          </div>
        </FormCard>

        {/* Design Notes */}
        <FormCard title="Design Notes" description="Notes for your future self or your AI design partner.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <div className="md:col-span-2">
              <ReadOnlyFieldWithTooltip htmlFor="worldContext" label="World Context" hint="Setting or world logic." value={row.world_context} />
            </div>
            <div className="md:col-span-2">
              <ReadOnlyFieldWithTooltip htmlFor="centralConflictGoal" label="Central Conflict or Goal" hint="What drives the story? Clear goal or conflict?" value={row.central_conflict_goal} />
            </div>
            <div className="md:col-span-2">
              <ReadOnlyFieldWithTooltip htmlFor="structuralNotes" label="Structural Notes" hint="Beat design, pacing ideas, special structure." value={row.structural_notes} />
            </div>
            <div className="md:col-span-2">
              <ReadOnlyFieldWithTooltip htmlFor="referenceWorks" label="Reference Works" hint="Books/shows to draw inspiration or comps." value={row.reference_works} />
            </div>
            <div className="md:col-span-2">
              <ReadOnlyFieldWithTooltip htmlFor="episodicStructure" label="Episodic Structure" hint="Unique patterns like alternating POVs, timelines." value={row.episodic_structure} />
            </div>
          </div>
        </FormCard>
      </div>
    </TooltipProvider>
  );
}
