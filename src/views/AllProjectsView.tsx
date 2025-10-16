/**
 * AllProjectsView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Post-auth landing page listing all narrative
 * projects for the current user with a CTA to create a new one.
 *
 * This update ONLY changes layout/styling classes to our shared utilities
 * and token-driven shadcn variants. No logic or data changes.
 *
 * What changed (class-level only):
 *  - Page padding   → .app-page
 *  - Row gaps       → .app-gap
 *  - Title style    → .app-h1
 *  - Cards          → .app-card-radius on project tiles + loading/empty shells
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AllProjectsView() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from("narrative_projects").select("*");
      if (!error) setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  if (loading)
    return <Card className="app-card-radius p-6 text-muted-foreground">Loading your projects…</Card>;

  const handleNewProjectClick = () => navigate("/projects/new");

  return (
    <div className="app-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between app-gap">
        <h1 className="app-h1">Welcome to Spinalith</h1>
        <Button onClick={handleNewProjectClick}>+ New Project</Button>
      </div>

      {/* Empty / Grid */}
      {projects.length === 0 ? (
        <Card className="app-card-radius p-6 text-muted-foreground">
          You don't have any narrative projects yet.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="app-card-radius cursor-pointer transition hover:shadow"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader>
                <CardTitle className="truncate">{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate">
                  {project.tone} {project.tone && project.format ? "|" : ""} {project.format}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div>
        <button
          className="text-xs underline text-muted-foreground"
          onClick={() => navigate("/projects")}
        >
          Advanced: projects list (delete / transfer)
        </button>
      </div>
    </div>
  );
}
