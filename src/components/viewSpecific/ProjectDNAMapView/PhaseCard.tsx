// PhaseCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * PhaseCard
 *
 * Represents a single workflow phase as a card with a title, description, status badge, and navigation button.
 * Used within the DNA map view to drive users to the appropriate step in the project pipeline.
 *
 * Props:
 * - title: Name of the phase (e.g., "Story Arcs")
 * - description: Brief detail of what the phase involves
 * - status: Workflow status of the phase: "done" | "available" | "locked"
 * - view: Internal key to identify which route to navigate to
 * - projectId: Project-specific ID used to build dynamic URLs
 */

export interface PhaseCardProps {
  title: string;
  description: string;
  status: "done" | "available" | "locked";
  view: string;
  projectId: string | undefined;
}

export const PhaseCard = ({ title, description, status, view, projectId }: PhaseCardProps) => {
  const navigate = useNavigate();

  const getBadge = () => {
    switch (status) {
      case "done":
        return <Badge className="bg-green-500 text-white">Done</Badge>;
      case "available":
        return <Badge className="bg-blue-500 text-white">Available</Badge>;
      case "locked":
        return <Badge variant="secondary">Locked</Badge>;
    }
  };

  const cardClicked = () => {
    if (status === "locked") return;

    const routeMap: Record<string, string> = {
      NarrativeConcept: "edit",
      StoryArcsView: "story-arcs",
      CharactersView: "character-design",
      StoryArcBeatsView: "beats",
      // Add more routes here
    };

    const routeSegment = routeMap[view];
    if (routeSegment && projectId) {
      navigate(`/projects/${projectId}/${routeSegment}`);
    }
  };

  return (
    <Card
      className="w-full max-w-sm shadow-lg hover:shadow-xl transition cursor-pointer"
      onClick={cardClicked}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {getBadge()}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {status !== "locked" && (
          <Button variant="outline" size="sm">
            {status === "done" ? "View" : "Start"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

