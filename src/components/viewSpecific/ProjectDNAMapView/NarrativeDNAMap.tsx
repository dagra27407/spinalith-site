// NarrativeDNAMap.tsx

import { useParams } from "react-router-dom";
import { PhaseCard } from "@/components/viewSpecific/ProjectDNAMapView/PhaseCard"
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * NarrativeDNAMapView
 *
 * Displays all the major narrative construction phases as a set of actionable cards.
 * Dynamically passes `projectId` to each card for routing.
 *
 * Uses:
 * - PhaseCard: Card component with title, description, status, view key, and projectId
 *
 * Route: /projects/:projectId
 * Children Routes: /projects/:projectId/{phaseRoute}
 */

const NarrativeDNAMap = () => {
  const { projectId } = useParams();

  const phaseList = [
    {
      title: "Story Arcs",
      description: "Define the overarching narrative arcs that shape your project.",
      status: "available",
      view: "StoryArcsView",
    },
    {
      title: "Story Arc Beats",
      description: "Break Story Arcs into primary moments.",
      status: "available",
      view: "StoryArcBeatsView",
    },
    {
      title: "Characters",
      description: "Design the major characters and link them to arcs and beats.",
      status: "available",
      view: "CharactersView",
    },
    {
      title: "Chapters",
      description: "Outline the chapter structure of your book.",
      status: "locked",
      view: "CharactersView",
    },
    // Add more phases as needed
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Narrative DNA Map</h2>
      <ScrollArea className="h-full w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phaseList.map((phase, index) => (
            <PhaseCard
              key={index}
              title={phase.title}
              description={phase.description}
              status={phase.status as "available" | "done" | "locked"}
              view={phase.view}
              projectId={projectId}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NarrativeDNAMap;
