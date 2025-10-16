/**
 * BeatEditView (v1.3 — context-aware nav + delete, schema-aligned)
 *
 * Create/Edit a single Beat inside a Story Arc.
 * - Create mode:  /projects/:projectId/story-arcs/:arcId/beats/new
 *   • Back/Cancel/Save → ArcDetailView (/projects/:projectId/story-arcs/:arcId)
 * - Edit mode:     /projects/:projectId/story-arcs/:arcId/beats/:beatId/edit
 *   • Back/Cancel/Save → BeatDetailView (/.../beats/:beatId)
 *   • Delete (Danger Zone) → ArcDetailView
 */

/**
 * BeatEditView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Create/Edit a single Beat inside a Story Arc.
 * This update ONLY changes layout/styling classes to use our shared
 * utilities/tokens from index.css. No logic, data, or routing changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap (outer rows; kept tiny inner gaps where helpful)
 *  - Title style    → .app-h1
 *  - Card corners   → .app-card-radius (shells + danger card)
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRow } from "@/lib/data/useRow";
import { useMutations } from "@/lib/data/useMutations";

import { FormCard } from "@/components/ui/FormCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Info, Trash2 } from "lucide-react";

// COLUMN MAP — aligned to your schema
const COL = {
  id: "beat_id",
  projectId: "narrative_project_id",
  arcId: "story_arc", // UUID of parent arc
  name: "beat_name",
  summary: "beat_summary",
  type: "beat_type",
  purpose: "beat_purpose",
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
        {/* Inner layout: keep tighter spacing for label/hint stack */}
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

export default function BeatEditView() {
  const navigate = useNavigate();
  const { projectId, arcId, beatId } = useParams();

  const isCreate = !beatId || beatId === "new";

  // Base URLs for context-aware navigation
  const arcUrl = `/projects/${projectId}/story-arcs/${arcId}`;
  const beatsUrl = `${arcUrl}/beats`;
  const beatUrl = `${beatsUrl}/${beatId}`;

  // When user clicks Back/Cancel
  const cancelHref = isCreate ? arcUrl : beatUrl;

  const { row, loading, error } = useRow<BeatRow>(
    "story_arc_beats",
    isCreate ? undefined : beatId,
    { idColumn: COL.id }
  );

  const {
    insert,
    upsert,
    remove: removeBeat,
    loading: saving,
    error: saveError,
  } = useMutations("story_arc_beats");

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    if (!row) return;
    setName((row as any)[COL.name] ?? "");
    setSummary((row as any)[COL.summary] ?? "");
    setType((row as any)[COL.type] ?? "");
    setPurpose((row as any)[COL.purpose] ?? "");
  }, [row]);

  const requiredMissing = !name.trim();

  async function onSubmit() {
    const base = {
      [COL.projectId]: projectId!,
      [COL.arcId]: arcId!,
      [COL.name]: name.trim(),
      [COL.summary]: summary.trim() || null,
      [COL.type]: type.trim() || null,
      [COL.purpose]: purpose.trim() || null,
    } as const;

    if (isCreate) {
      const res = await insert<BeatRow>(base as any);
      if (res.ok) {
        // After creating, return to the Arc detail view
        navigate(arcUrl);
      }
      return;
    }

    const res = await upsert<BeatRow>({ ...(base as any), [COL.id]: beatId } as any, COL.id);
    if (res.ok) {
      // After editing, return to the Beat detail view
      navigate(beatUrl);
    }
  }

  // Loading / error shells with consistent radius
  if (!isCreate && loading) return <Card className="app-card-radius p-6">Loading…</Card>;
  if (!isCreate && (error || !row))
    return <Card className="app-card-radius p-6 text-destructive">Beat not found.</Card>;

  return (
    <TooltipProvider>
      <div className="app-page space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between app-gap">
          <h1 className="app-h1">{isCreate ? "New Beat" : "Edit Beat"}</h1>
          <Button variant="secondary" onClick={() => navigate(cancelHref)}>
            {isCreate ? "Back to Arc" : "Back to Beat"}
          </Button>
        </div>

        <FormCard title="Beat" description="Short, atomic story moment.">
          <div className="grid grid-cols-1 md:grid-cols-2 app-gap">
            <FieldWithTooltip htmlFor="name" label="Title" hint="Short handle for this beat.">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., The warning" />
              <p className="text-xs text-muted-foreground mt-1">Required</p>
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="type" label="Type" hint="Optional category (e.g., inciting, midpoint, twist).">
              <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., reversal" />
            </FieldWithTooltip>

            <FieldWithTooltip htmlFor="purpose" label="Purpose" hint="Why this beat exists / what it accomplishes.">
              <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., raise stakes, foreshadow" />
            </FieldWithTooltip>

            <div className="md:col-span-2">
              <FieldWithTooltip htmlFor="summary" label="Summary" hint="One or two sentences describing what happens.">
                <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} placeholder="What happens?" />
              </FieldWithTooltip>
            </div>
          </div>
        </FormCard>

        <div className="flex justify-end app-gap pt-2">
          <Button variant="secondary" onClick={() => navigate(cancelHref)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving || requiredMissing}>
            {saving ? "Saving…" : isCreate ? "Create Beat" : "Save Changes"}
          </Button>
        </div>

        {/* Danger Zone — only in EDIT mode */}
        {!isCreate && (
          <Card className="app-card-radius p-4 border-destructive/40 mt-6">
            <div className="text-sm font-semibold text-destructive">Danger Zone</div>
            <p className="text-sm text-muted-foreground">Deleting a beat is permanent.</p>
            <div className="mt-3">
              <ConfirmDialog
                title="Delete beat?"
                description="This will permanently delete this beat."
                trigger={
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Beat
                  </Button>
                }
                onConfirm={async () => {
                  const id = (row as any)[COL.id] as string;
                  const res = await removeBeat(id, COL.id);
                  if (res.ok) navigate(arcUrl);
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
