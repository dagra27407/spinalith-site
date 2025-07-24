import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


/**
 * AllProjectsView
 *
 * This is the main post-authentication dashboard displaying all user-created narrative projects.
 * 
 * Features:
 * - Lists all narrative projects associated with the current user/session.
 * - Offers a CTA to create a new project ("+ New Project" button).
 * - Serves as the primary entry point into project-specific workspaces.
 * 
 * This component is routed at path `/` and is the user's default landing page after login.
 * It is the central hub for project navigation and selection.
 * 
 * Future enhancements may include:
 * - Search and filter functionality
 * - Project pinning or starring
 * - Quick stats or progress indicators per project
 * 
 * @returns {JSX.Element} The rendered project selection and creation interface.
 */
export default function AllProjectsView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from("narrative_projects").select("*");
      if (!error) {
        setProjects(data || []);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  if (loading) return <div className="p-6 text-muted-foreground">Loading your projects...</div>;

  const handleNewProjectClick = () => {
  navigate("/new-project"); // Match the route you defined in `Router.tsx`
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome to Spinalith</h1>
        <Button onClick={handleNewProjectClick}>
          + New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-muted-foreground">You don't have any narrative projects yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {project.tone} | {project.format}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
