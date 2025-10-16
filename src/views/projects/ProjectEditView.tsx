/**
 * ProjectEditView
 *
 * Plain-English: One page that handles **create** and **edit** for a Narrative Project.
 * - If the URL is `/projects/new`, it shows a blank form to create a project.
 * - If the URL is `/projects/:projectId/edit`, it loads that project and lets you edit it.
 *
 * What it does:
 * - Loads the existing project via `useRow('narrative_projects', projectId)` (edit mode).
 * - Saves via `useMutations('narrative_projects')` (insert / upsert).
 * - Validates required fields (Title) and disables Save when invalid.
 * - After **create**, navigates to the new project's dashboard `/projects/:id`.
 * - After **edit**, navigates back to the project's dashboard.
 *
 * DB Schema (expected columns on `narrative_projects`)
 *  - id (uuid, PK)
 *  - title (text)
 *  - tone (text)
 *  - core_themes (text)
 *  - story_summary (text)
 *  - format (text)
 *  - format_intent (text)
 *  - episode_or_chapter (text: 'episode' | 'chapter')
 *  - episode_chapter_count (int)
 *  - hard_chapter_limit (bool)
 *  - intended_audience (text)
 *  - content_restrictions (text)
 *  - genre_tags (text)
 *  - world_context (text)
 *  - central_conflict_goal (text)
 *  - structural_notes (text)
 *  - reference_works (text)
 *  - episodic_structure (text)
 */

/**
 * ProjectEditView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Create/Edit a Narrative Project. This update ONLY
 * changes layout/styling classes to our shared utilities/tokens. No logic,
 * data, or routing changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap (replaces scattered gap-4)
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius for loading/error shells
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
  episode_or_chapter: string | null;            // 'episode' | 'chapter'
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
 * FieldWithTooltip
 * Wraps a full field (label + inline helper + control) in a TooltipTrigger.
 * The tooltip shows the same helper text used inline.
 */
function FieldWithTooltip({
  htmlFor,
  label,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
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
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{hint}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function ProjectEditView() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isCreate = !projectId || projectId === 'new';
  const cancelHref = isCreate ? '/' : `/projects/${projectId}`;

  const { row, loading, error } = useRow<ProjectRow>('narrative_projects', isCreate ? undefined : projectId);
  const { insert, upsert, loading: saving, error: saveError } = useMutations('narrative_projects');

  const [title, setTitle] = useState('');
  const [tone, setTone] = useState('');
  const [coreThemes, setCoreThemes] = useState('');
  const [summary, setSummary] = useState('');
  const [format, setFormat] = useState('');
  const [formatIntent, setFormatIntent] = useState('');
  const [episodeOrChapter, setEpisodeOrChapter] = useState('');
  const [episodeChapterCount, setEpisodeChapterCount] = useState<number | ''>('');
  const [hardChapterLimit, setHardChapterLimit] = useState(false);
  const [audience, setAudience] = useState('');
  const [contentRestrictions, setContentRestrictions] = useState('');
  const [genreTags, setGenreTags] = useState('');
  const [worldContext, setWorldContext] = useState('');
  const [centralConflictGoal, setCentralConflictGoal] = useState('');
  const [structuralNotes, setStructuralNotes] = useState('');
  const [referenceWorks, setReferenceWorks] = useState('');
  const [episodicStructure, setEpisodicStructure] = useState('');

  useEffect(() => {
    if (!row) return;
    setTitle(row.title ?? '');
    setTone(row.tone ?? '');
    setCoreThemes(row.core_themes ?? '');
    setSummary(row.story_summary ?? '');
    setFormat(row.format ?? '');
    setFormatIntent(row.format_intent ?? '');
    setEpisodeOrChapter(row.episode_or_chapter ?? '');
    setEpisodeChapterCount(row.episode_chapter_count ?? '');
    setHardChapterLimit(!!row.hard_chapter_limit);
    setAudience(row.intended_audience ?? '');
    setContentRestrictions(row.content_restrictions ?? '');
    setGenreTags(row.genre_tags ?? '');
    setWorldContext(row.world_context ?? '');
    setCentralConflictGoal(row.central_conflict_goal ?? '');
    setStructuralNotes(row.structural_notes ?? '');
    setReferenceWorks(row.reference_works ?? '');
    setEpisodicStructure(row.episodic_structure ?? '');
  }, [row]);

  const requiredMissing = !title.trim();

  async function onSubmit() {
    const base = {
      title: title.trim(),
      tone: tone.trim() || null,
      core_themes: coreThemes.trim() || null,
      story_summary: summary.trim() || null,
      format: format.trim() || null,
      format_intent: formatIntent.trim() || null,
      episode_or_chapter: episodeOrChapter || null,
      episode_chapter_count:
        typeof episodeChapterCount === 'number' ? episodeChapterCount : episodeChapterCount === '' ? null : Number(episodeChapterCount) || null,
      hard_chapter_limit: hardChapterLimit,
      intended_audience: audience.trim() || null,
      content_restrictions: contentRestrictions.trim() || null,
      genre_tags: genreTags.trim() || null,
      world_context: worldContext.trim() || null,
      central_conflict_goal: centralConflictGoal.trim() || null,
      structural_notes: structuralNotes.trim() || null,
      reference_works: referenceWorks.trim() || null,
      episodic_structure: episodicStructure.trim() || null,
    } as const;

    if (isCreate) {
      const res = await insert<ProjectRow>(base as any);
      if (res.ok && res.data?.id) navigate(`/projects/${res.data.id}`);
      return;
    }

    const res = await upsert<ProjectRow>({ ...base, id: projectId } as any);
    if (res.ok) navigate(`/projects/${projectId}`);
  }

  // Loading / error shells use standardized radius
  if (!isCreate && loading) return <Card className="app-card-radius p-6">Loading…</Card>;
  if (!isCreate && (error || !row)) return <Card className="app-card-radius p-6 text-destructive">Project not found.</Card>;

  return (
    <TooltipProvider>
      <div className="app-page space-y-6">
        <div className="flex items-center justify-between app-gap">
          <h1 className="app-h1">{isCreate ? 'New Project' : 'Edit Project'}</h1>
          <Button variant="secondary" onClick={() => navigate(cancelHref)}>Cancel</Button>
        </div>

        {/* Story Overview */}
        <FormCard title="Story Overview" description="Define the creative tone and summarize the vision.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <FieldWithTooltip htmlFor="title" label="Title" hint="The name of your book or series.">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter story title" />
              <p className="text-xs text-muted-foreground mt-1">Required</p>
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="tone" label="Tone" hint="Emotional feel or atmosphere (e.g., dark, hopeful).">
              <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Mood or atmosphere of the story" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="coreThemes" label="Core Themes" hint="Concepts explored — e.g., redemption, betrayal.">
              <Input id="coreThemes" value={coreThemes} onChange={(e) => setCoreThemes(e.target.value)} placeholder="e.g. redemption, betrayal" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="summary" label="Story Summary" hint="Short paragraph describing your story’s premise.">
              <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} placeholder="Short description of the premise" />
            </FieldWithTooltip>
          </div>
        </FormCard>

        {/* Structural Intent */}
        <FormCard title="Structural Intent" description="How will the story be delivered and organized?">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <FieldWithTooltip htmlFor="format" label="Format" hint="The container: Novel, Serial, Script, etc.">
              <Input id="format" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="e.g. Book, Web Serial" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="formatIntent" label="Format Intent" hint="Why this format fits your goals.">
              <Input id="formatIntent" value={formatIntent} onChange={(e) => setFormatIntent(e.target.value)} placeholder="e.g. Standalone novel, Series pilot" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="episodeOrChapter" label="Story Units" hint="How you break up your story.">
              <Select value={episodeOrChapter} onValueChange={setEpisodeOrChapter}>
                <SelectTrigger id="episodeOrChapter"><SelectValue placeholder="Select story unit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="episode">Episode</SelectItem>
                  <SelectItem value="chapter">Chapter</SelectItem>
                </SelectContent>
              </Select>
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="episodeChapterCount" label="Episode/Chapter Count" hint="Expected number of installments.">
              <Input
                id="episodeChapterCount"
                inputMode="numeric"
                value={episodeChapterCount}
                onChange={(e) => {
                  const v = e.target.value;
                  setEpisodeChapterCount(v === '' ? '' : Number.parseInt(v, 10));
                }}
                placeholder="Number of installments"
              />
            </FieldWithTooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Label htmlFor="hardChapterLimit">Hard Chapter Limit?</Label>
                  <Switch id="hardChapterLimit" checked={hardChapterLimit} onCheckedChange={setHardChapterLimit} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>If checked, keep to the exact count above.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </FormCard>

        {/* Audience & Boundaries */}
        <FormCard title="Audience & Boundaries" description="Who is this for, and what should we know?">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <FieldWithTooltip htmlFor="audience" label="Intended Audience" hint="Who the story is aimed at.">
              <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Adult, Young Adult" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="contentRestrictions" label="Content Restrictions" hint="Boundaries to observe: no gore, PG-13, etc.">
              <Input id="contentRestrictions" value={contentRestrictions} onChange={(e) => setContentRestrictions(e.target.value)} placeholder="Violence, language, etc." />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="genreTags" label="Genre Tags" hint="Comma-separated genres/subgenres.">
              <Input id="genreTags" value={genreTags} onChange={(e) => setGenreTags(e.target.value)} placeholder="e.g. Fantasy, Thriller" />
            </FieldWithTooltip>
          </div>
        </FormCard>

        {/* Design Notes */}
        <FormCard title="Design Notes" description="Notes for your future self or your AI design partner.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <FieldWithTooltip htmlFor="worldContext" label="World Context" hint="Setting or world logic.">
              <Textarea id="worldContext" value={worldContext} onChange={(e) => setWorldContext(e.target.value)} placeholder="Notes on setting or world logic" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="centralConflictGoal" label="Central Conflict or Goal" hint="What drives the story? Clear goal or conflict?">
              <Textarea id="centralConflictGoal" value={centralConflictGoal} onChange={(e) => setCentralConflictGoal(e.target.value)} placeholder="e.g. Escape the regime, find the relic" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="structuralNotes" label="Structural Notes" hint="Beat design, pacing ideas, special structure.">
              <Textarea id="structuralNotes" value={structuralNotes} onChange={(e) => setStructuralNotes(e.target.value)} placeholder="Beat design, pacing ideas, special structure" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="referenceWorks" label="Reference Works" hint="Books/shows to draw inspiration or comps.">
              <Textarea id="referenceWorks" value={referenceWorks} onChange={(e) => setReferenceWorks(e.target.value)} placeholder="List key references or comps" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="episodicStructure" label="Episodic Structure" hint="Unique patterns like alternating POVs, timelines.">
              <Textarea id="episodicStructure" value={episodicStructure} onChange={(e) => setEpisodicStructure(e.target.value)} placeholder="e.g., Rotating POV, nested timelines" />
            </FieldWithTooltip>
          </div>
        </FormCard>

        <div className="flex justify-end app-gap pt-2">
          <Button variant="secondary" onClick={() => navigate(cancelHref)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving || requiredMissing}>
            {saving ? 'Saving…' : isCreate ? 'Create Project' : 'Save Changes'}
          </Button>
        </div>

        {saveError ? <div className="text-destructive text-sm mt-2">{saveError}</div> : null}
      </div>
    </TooltipProvider>
  );
}

