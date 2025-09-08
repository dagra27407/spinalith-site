/**
 * ProjectHome
 *
 * Project-specific dashboard shown after selecting a narrative project.
 * Displays workflow CTAs (e.g. start arcs, add characters) and progress.
 * Uses route param `projectId` to dynamically load project content.
 *
 * @returns {JSX.Element} Per-project workspace dashboard.
 */

import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import NarrativeDNAMap from "@/components/viewSpecific/ProjectDNAMapView/NarrativeDNAMap";
import { run_EF } from "@/lib/run_EF"

const MainProjectView = () => {
  let hasRunGreeting = useRef(false); //Used to prevent rerun of LLM Personalization unless actual view reload!
  const { projectId } = useParams();
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [greetingText, setGreetingText] = useState("One sec, just reviewing your project!");

  useEffect(() => {
    //Fetch project data to populate view
    const fetchProject = async () => {
      if (!projectId) return;
      const { data, error } = await supabase
        .from("narrative_projects")
        .select("title")
        .eq("id", projectId)
        .single();

      if (!error && data?.title) {
        setProjectTitle(data.title);
      }
    };

    //If projectId or user.id don't exist, early exit
    if (!projectId) return;

    //key used in setting greeting
    const key = `mpv:greeting:${projectId}`;

    // 1) Local cache check (respect hasRunGreeting)
    if (!hasRunGreeting.current) {
      const cached = loadGreetingFromCache(key);
      const TTL_MS = 60 * 60 * 1000; //min * seconds * ms (update 1st number to desired threshold)

      if (cached) {
        const fresh = Date.now() - new Date(cached.cached_at).getTime() <= TTL_MS;
        if (fresh) {
          setGreetingText(cached.suggestion);
          hasRunGreeting.current = true; // important: prevents any re-run on re-renders (stops runGreetingPrep)
        }
      }
      // If not fresh/missing, runGreetingPrep path execute below
    }

    //If new greeting needed get one
    const runGreetingPrep = async () => {
    if (projectId && !hasRunGreeting.current) {
      hasRunGreeting.current = true;
      //console.log("projectId in prepGreetingPrompt:", projectId);
      const greetingData = await prepGreetingPrompt(projectId);
      if (greetingData) {
        setGreetingText(greetingData);
        saveGreetingToCache(key, greetingData);
        //console.log("LLM Response Text:", greetingData);
      } else {
        console.warn("No greeting text returned from LLM.");
      }
    }
  };

    fetchProject();
    runGreetingPrep();
  }, [projectId]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          {projectTitle ? `🧬 Project: ${projectTitle}` : "Loading..."}
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your Narrative DNA Map. Begin unlocking your story.
        </p>
      </div>

      <div className="rounded-xl border p-4 bg-muted shadow-sm">
        <p className="text-sm italic text-muted-foreground">
          🧠 <strong>Spinalith suggests:</strong> {greetingText}
        </p>
      </div>


      <NarrativeDNAMap />
    </div>
  );
}; //END OF MainProjectView
export default MainProjectView;


/**
 * Prepares and sends a personalized greeting prompt to the LLM via a generic edge function call.
 * 
 * This function:
 * 1. Fetches narrative project metadata (`title`, `story_summary`) from Supabase.
 * 2. Retrieves a stored prompt template from the `util_prompt_warehouse` table.
 * 3. Injects the narrative project details into the template using string substitution.
 * 4. Sends the constructed prompt to the `ef_LLM_OneShot` Edge Function for LLM processing.
 * 5. Parses and returns the assistant's response (if valid), or logs a warning if unexpected.
 * 
 * @async
 * @function prepGreetingPrompt
 * @param {string} projectId - The UUID of the narrative project to personalize the greeting for.
 * @returns {Promise<string|null>} - The assistant's greeting message, or `null` if an error occurs or response is malformed.
 * 
 * @example
 * const greeting = await prepGreetingPrompt("abc123");
 * console.log("LLM says:", greeting);
 */

async function prepGreetingPrompt (projectId: string){
  const utilName = "util_MainProjectViewGreeting"
  const efName = "ef_LLM_OneShot"
  if (!projectId) return;

  // Fetch narrative project details
  const { data: npRecord, error: npError } = await supabase
    .from("narrative_projects")
    .select("title, story_summary")
    .eq("id", projectId)
    .single();

  if (npError || !npRecord) {
    console.error("MainProjectView - Failed to fetch narrative project:", npError);
    return;
  }

  // Fetch the greeting prompt template
  const { data: pwRecord, error: pwError } = await supabase
    .from("util_prompt_warehouse")
    .select("prompt")
    .eq("util_name", utilName)
    .single();

  if (pwError || !pwRecord) {
    console.error("MainProjectView - Failed to fetch prompt:", pwError);
    return;
  }

  // Inject values into the prompt
  const constructedPrompt = pwRecord.prompt
    .replaceAll("{{projectTitle}}", npRecord.title)
    .replaceAll("{{storySummary}}", npRecord.story_summary || "a new idea you're still shaping")
    .replaceAll(
      "{{possibleActions}}",
      "refining the story concept, defining characters, crafting story arcs"
    );

  //console.log(`constructedPrompt: ${constructedPrompt}`);

  let payload = { request_key: utilName,
                request_prompt: constructedPrompt,
                narrative_project_id: projectId
  }
  try{
    // Invoke the edge function via our generic runner
    const response = await run_EF(efName, payload);
    if (response?.response?.data?.choices?.[0]?.message?.content) {
            //console.log("LLM Response Data:", response);
      return response.response.data.choices[0].message.content;
    } else {
      console.warn("Unexpected LLM response format:", response);
      return null;
    }
  } catch (err: any) {
        // Show parsing or HTTP errors in the UI
        console.error('Error:', err);
      }

}; //END OF prepGreetingPrompt



/**
 * Save a project greeting suggestion to localStorage.
 *
 * @param key - Unique cache key (e.g. "mpv:greeting:userId:projectId")
 * @param suggestion - The text from the LLM to store
 */
export function saveGreetingToCache(key: string, suggestion: string): void {
  try {
    const entry = {
      suggestion,
      cached_at: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    console.error("❌ Failed to save greeting to localStorage:", err);
  }
} //END OF saveGreetingToCache



/**
 * Load a project greeting suggestion from localStorage.
 *
 * @param key - Unique cache key (e.g. "mpv:greeting:userId:projectId")
 * @returns An object with { suggestion, cached_at } or null if not found/invalid
 */
export function loadGreetingFromCache(
  key: string
): { suggestion: string; cached_at: string } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (typeof parsed.suggestion === "string" && typeof parsed.cached_at === "string") {
      return parsed;
    }

    console.warn("⚠️ Invalid cache shape for greeting:", parsed);
    return null;
  } catch (err) {
    console.error("❌ Failed to load greeting from localStorage:", err);
    return null;
  }
} // END OF loadGreetingFromCache






