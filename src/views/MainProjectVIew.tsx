/**
 * ProjectHome
 *
 * Project-specific dashboard shown after selecting a narrative project.
 * Displays workflow CTAs (e.g. start arcs, add characters) and progress.
 * Uses route param `projectId` to dynamically load project content.
 *
 * Layout alignment (project standards):
 *  - Page padding → .app-page (from index.css)
 *  - Title style  → .app-h1
 *  - Card radius  → .app-card-radius
 *
 * @returns {JSX.Element} Per-project workspace dashboard.
 */

/**
 * MainProjectView (snap-to-standards pass)
 *
 * Plain-English (2am-you): Project dashboard shown after selecting a project.
 * This update ONLY touches layout classes to align with shared tokens.
 * No logic, data, or routing changes.
 *
 * What changed (class-level only):
 *  - Page wrapper   → .app-page
 *  - Vertical rhythm→ space-y-6
 *  - Title style    → .app-h1
 *  - Suggestion box → .app-surface .app-card-radius (.app-shadow for depth)
 */

import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import NarrativeDNAMap from "@/components/viewSpecific/ProjectDNAMapView/NarrativeDNAMap";
import { run_EF } from "@/lib/run_EF";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProjectDetailsCard from "@/components/viewSpecific/ProjectDNAMapView/ProjectDetailsCard";
import { Card, CardContent } from "@/components/ui/card";

const MainProjectView = () => {
  // Prevent repeat personalized-greeting calls between rerenders
  const hasRunGreeting = useRef(false);

  const { projectId } = useParams();
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [greetingText, setGreetingText] = useState(
    "One sec, just reviewing your project!"
  );
  const LLM_GREETING_ENABLED = false; // feature flag
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch project title for header
    const fetchProject = async () => {
      if (!projectId) return;
      const { data, error } = await supabase
        .from("narrative_projects")
        .select("title")
        .eq("id", projectId)
        .single();

      if (!error && data?.title) setProjectTitle(data.title);
    };

    if (!projectId) return;

    // Local cache key for greeting
    const key = `mpv:greeting:${projectId}`;

    // 1) Try cache first (respect ref so we don't re-run)
    if (!hasRunGreeting.current) {
      const cached = loadGreetingFromCache(key);
      const TTL_MS = 60 * 60 * 1000; // 1 hour
      if (cached) {
        const fresh = Date.now() - new Date(cached.cached_at).getTime() <= TTL_MS;
        if (fresh) {
          setGreetingText(cached.suggestion);
          hasRunGreeting.current = true;
        }
      }
    }

    // 2) If feature-enabled and no fresh cache, prep and run greeting
    const runGreetingPrep = async () => {
      if (projectId && !hasRunGreeting.current) {
        hasRunGreeting.current = true;
        const greetingData = await prepGreetingPrompt(projectId);
        if (greetingData) {
          setGreetingText(greetingData);
          saveGreetingToCache(key, greetingData);
        } else {
          console.warn("No greeting text returned from LLM.");
        }
      }
    };

    fetchProject();
    if (LLM_GREETING_ENABLED) runGreetingPrep();
  }, [projectId]);

  return (
    <div className="app-page space-y-6">
      {/* Header */}
      <div>
        <h1 className="app-h1">
          {projectTitle ? `🧬 Project: ${projectTitle}` : "Loading..."}
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your Narrative DNA Map. Begin unlocking your story.
        </p>
      </div>

      {/* Suggestion from LLM (or cache) */}
      <div className="app-surface app-card-radius app-shadow p-4">
        <p className="text-sm italic text-muted-foreground">
          🧠 <strong>Spinalith suggests:</strong> {greetingText}
        </p>
      </div>

      {/* Primary dashboard cards */}
      <ProjectDetailsCard />
      <NarrativeDNAMap />
    </div>
  );
};

export default MainProjectView;

/**
 * Prepares and sends a personalized greeting prompt to the LLM via an Edge Function.
 * See original for detailed inline docs.
 */
async function prepGreetingPrompt(projectId: string) {
  const utilName = "util_MainProjectViewGreeting";
  const efName = "ef_LLM_OneShot";
  if (!projectId) return;

  const { data: npRecord, error: npError } = await supabase
    .from("narrative_projects")
    .select("title, story_summary")
    .eq("id", projectId)
    .single();
  if (npError || !npRecord) return;

  const { data: pwRecord, error: pwError } = await supabase
    .from("util_prompt_warehouse")
    .select("prompt")
    .eq("util_name", utilName)
    .single();
  if (pwError || !pwRecord) return;

  const constructedPrompt = pwRecord.prompt
    .replaceAll("{{projectTitle}}", npRecord.title)
    .replaceAll(
      "{{storySummary}}",
      npRecord.story_summary || "a new idea you're still shaping"
    )
    .replaceAll(
      "{{possibleActions}}",
      "refining the story concept, defining characters, crafting story arcs"
    );

  const payload = {
    request_key: utilName,
    request_prompt: constructedPrompt,
    narrative_project_id: projectId,
  };

  try {
    const response = await run_EF(efName, payload);
    if (response?.response?.data?.choices?.[0]?.message?.content) {
      return response.response.data.choices[0].message.content;
    } else {
      console.warn("Unexpected LLM response format:", response);
      return null;
    }
  } catch (err: any) {
    console.error("Error:", err);
  }
}

/** Local cache helpers for greeting text */
export function saveGreetingToCache(key: string, suggestion: string): void {
  try {
    const entry = { suggestion, cached_at: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    console.error("❌ Failed to save greeting to localStorage:", err);
  }
}

export function loadGreetingFromCache(
  key: string
): { suggestion: string; cached_at: string } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.suggestion === "string" &&
      typeof parsed.cached_at === "string"
    )
      return parsed;
    return null;
  } catch (err) {
    console.error("❌ Failed to load greeting from localStorage:", err);
    return null;
  }
}
