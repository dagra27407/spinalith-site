/**
 * ArcDetailView
 *
 * Plain-English: Page to **view** a single Story Arc in read-only mode.
 * Shows the arc’s title, type, importance, and summary, plus a placeholder
 * card for its related Beats (to be built later).
 *
 * What it does:
 *  - Reads the arc id from the URL via useParams()
 *  - Uses useRow('story_arcs', arcId) to fetch the record
 *  - Displays all fields in a Card
 *  - Offers buttons for Back and Edit
 *  - Includes a “Beats” section placeholder that links to a future Beats list page
 *
 * Routing expectations:
 *   - Mounted under /projects/:projectId/story-arcs/:arcId
 */
/**
 * ArcDetailView
 *
 * Plain-English (2am-you): Read-only page for a single Story Arc.
 * What changed here: layout classes only, to snap to project-wide tokens.
 *   - Page padding  → .app-page (from index.css)
 *   - Row gaps      → .app-gap
 *   - Title style   → .app-h1
 *   - Card corners  → .app-card-radius
 *
 * No logic/routing changes. Data fetching and Back/Edit behavior are unchanged.
 */

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useRow } from "@/lib/data/useRow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BeatsListView from "@/views/beats/BeatsListView";
import FormCard from "@/components/ui/FormCard";

interface ArcRow {
  story_arc_id: string;
  arc_name: string | null;
  arc_type: string | null;
  arc_level: string | null;
  arc_description: string | null;
  arc_resolution: string | null; // NEW
  conflict_potential: string | null; // NEW
}

export default function ArcDetailView() {
  const { projectId, arcId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Back target rules:
  //  - If we navigated here from the Beats Hub, return there
  //  - Otherwise, go back to the Arcs list
  const backDefault = `/projects/${projectId}/story-arcs`;
  const backFromHub = `/projects/${projectId}/beats`;
  const backHref = (location.state as any)?.from === "beats-hub" ? backFromHub : backDefault;

  const { row, loading, error } = useRow<ArcRow>("story_arcs", arcId, { idColumn: "story_arc_id" });

  // Loading & error states (simple Card shells, consistent radius)
  if (loading) return <Card className="app-card-radius p-6">Loading…</Card>;
  if (error || !row)
    return (
      <Card className="app-card-radius p-6 text-destructive">Arc not found.</Card>
    );

  return (
    <div className="app-page space-y-6">
      {/* Header row: title + actions */}
      <div className="flex items-center justify-between app-gap">
        <h1 className="app-h1">{row.arc_name ?? "—"}</h1>
        <div className="flex app-gap">
          {/* View pages convention: Back (outline), Edit (default) */}
          <Button variant="outline" onClick={() => navigate(backHref)}>
            Back
          </Button>
          <Button onClick={() => navigate("edit")}>Edit Arc</Button>
          {/* <Button onClick={() => navigate("beats")}>Manage Beats</Button> */}
        </div>
      </div>

      {/* Arc details card */}
      <Card className="app-card-radius p-6 space-y-3">
        <div>
          <span className="text-sm text-muted-foreground">Type:</span> {row.arc_type ?? "—"}
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Level:</span> {row.arc_level ?? "—"}
        </div>

        <div className="text-sm text-muted-foreground pt-2">Summary</div>
        <div>{row.arc_description ?? "—"}</div>

        <div className="text-sm text-muted-foreground pt-2">Arc Resolution</div>
        <div>{row.arc_resolution ?? "—"}</div>

        <div className="text-sm text-muted-foreground pt-2">Conflict Potential</div>
        <div>{row.conflict_potential ?? "—"}</div>
      </Card>

      {/* Embedded beats list (unchanged) */}
      <FormCard
        title="Arc Beats"
        description="Define the key moments of this Story Arc with Beats."
      >
        <BeatsListView embedded />
      </FormCard>
    </div>
  );
}
