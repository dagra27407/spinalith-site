/**
 * ProjectDetailsCard
 *
 * Plain-English: A compact, read-only snapshot of the selected project’s key info
 * (title, tone, format, audience, summary) with a small “Edit” button.
 *
 * How it works:
 * - Reads :projectId from the URL and fetches that row from `narrative_projects`
 *   using `useRow`.
 * - Shows loading / not-found states.
 * - Renders primary fields in a tidy card; no mutations happen here.
 * - The “Edit” button routes to /projects/:projectId/edit.
 *
 * When to use:
 * - Drop this card near the top of MainProjectView to show what the project is,
 *   and give users a fast path to edit details.
 *
 * Inputs/assumptions:
 * - Route param `projectId` exists.
 * - Table columns used: id, title, tone, format, intended_audience, story_summary.
 */


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { useRow } from "@/lib/data/useRow";

type Row = {
  id: string;
  title: string | null;
  tone: string | null;
  format: string | null;
  intended_audience: string | null;
  story_summary: string | null;
};

export default function ProjectDetailsCard() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { row, loading, error } = useRow<Row>(
    "narrative_projects",
    projectId
  );

  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Details</CardTitle>
            <div className="flex gap-2">
            <Button
                size="sm"
                onClick={() => projectId && navigate(`/projects/${projectId}/details`)}
            >
                View details
            </Button>
            </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : error || !row ? (
          <div className="text-sm text-destructive">Project not found.</div>
        ) : (
          <>
            <div className="text-lg font-semibold">
              {row.title ?? "Untitled Project"}
            </div>
                <div className="text-sm text-muted-foreground space-y-1">
                <div>{row.tone ? `Tone: ${row.tone}` : "Tone: —"}</div>
                <div>{row.format ? `Format: ${row.format}` : "Format: —"}</div>
                <div>
                    {row.intended_audience ? `Audience: ${row.intended_audience}` : "Audience: —"}
                </div>
            </div>

            <div className="text-sm">
              {row.story_summary
                ? `Summary: ${row.story_summary}`
                : "No summary yet. Click Edit to add one."}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
