
/**
 * import calls
 **/
import React from "react"
import { useState } from "react";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { useNarrativeProject } from "@/stores/useNarrativeProjectStore";
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner' //Toaster is included in Core_Layout_Modular.tsx which handles top level layout structure

/**
 * Logs a checkpoint with a timestamp and optional attached element.
 * Helpful for debugging function flow and inspecting values at key stages.
 *
 * @param {string} message - A custom label to describe the checkpoint.
 * @param {any} [element] - Optional object or value to inspect in console.
 */
export const logCheckpoint = (message: string, element?: any): void => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🛑 [${timestamp}] Checkpoint: ${message}`);
  if (element !== undefined) {
    console.log("🔍 Element:", element);
  }
};


/********************************************
 * Logic workflow functions
 *******************************************/

/** insertNarrativeProject
 * Inserts a new narrative project into the Supabase database.
 * Pulls current form values from the Zustand store and inserts them as a new record.
 * Returns a single inserted row (or null if failed).
 *
 * @returns {Promise<{ data: any; error: any }>} Result from Supabase `.insert().select().single()`
 */
const insertNarrativeProject = async () => {
  //logCheckpoint("Starting:  insertNarrativeProject")
  // 🔹 Step 1: Pull data from global state (Zustand)
  const {
    title,
    tone,
    core_themes,
    story_summary,
    format,
    format_intent,
    episode_or_chapter,
    episode_chapter_count,
    hard_chapter_limit,
    intended_audience,
    content_restrictions,
    genre_tags,
    world_context,
    central_conflict_goal,
    structural_notes,
    reference_works,
    episodic_structure,
  } = useNarrativeProject.getState();

  // 🔹 Step 2: Perform the insert operation
  return await supabase
    .from("narrative_projects")
    .insert([
      {
        title,
        tone,
        core_themes,
        story_summary,
        format,
        format_intent,
        episode_or_chapter,
        episode_chapter_count,
        hard_chapter_limit,
        intended_audience,
        content_restrictions,
        genre_tags,
        world_context,
        central_conflict_goal,
        structural_notes,
        reference_works,
        episodic_structure,
        // Add additional fields here if needed
      },
    ])
    .select()
    .single(); // 🔸 Use .single() if only expecting one row in response
}; //End of insertNarrativeProject

/**
 * validateInsert
 * Validates that the most recently inserted narrative project matches all submitted fields.
 *
 * @param {string} userId - The ID of the current authenticated user.
 * @returns {Promise<boolean>} - Returns true if an exact matching record is found, false otherwise.
 */
export const validateInsert = async (userId: string): Promise<boolean> => {
  //logCheckpoint("Starting:  validateInsert")
  try {
    // 🔹 Get allowed current form data from Zustand store (the ones we need to validate)
    const allowedFields = [
      "title", "tone", "core_themes", "story_summary", "format",
      "format_intent", "episode_or_chapter", "episode_chapter_count",
      "hard_chapter_limit", "intended_audience", "content_restrictions",
      "genre_tags", "world_context", "central_conflict_goal",
      "structural_notes", "reference_works", "episodic_structure",
    ];
    // Get all fields in the zustand store
    const fullState = useNarrativeProject.getState();

    //filter fullState to just the columns listed in allowedFields that are not null or undefined
    const matchPayload = Object.fromEntries(
      allowedFields
        .filter((key) => fullState[key] !== undefined && fullState[key] !== null)
        .map((key) => [key, fullState[key]])
    );

    // Use in Supabase query
    const { data, error } = await supabase
      .from("narrative_projects")
      .select("*")
      .match(matchPayload)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    // 🔸 Handle any fetch error
    if (error) {
      console.error("❌ Validation fetch error:", error.message);
      return false;
    }

    // 🔸 Check if a valid match was returned
    return data && data.length > 0;
  } catch (err) {
    console.error("❌ Unexpected validation error:", err);
    return false;
  }
}; //End of validateInsert


/**
 * postInsertWorkflow
 * Executes the post-insert workflow after a successful project submission.
 * @param {string} title - The submitted project title.
 * @param {string} userId - The current authenticated user ID.
 */
export const postInsertWorkflow = async (title: string, userId: string): Promise<void> => {
  //logCheckpoint("Starting:  postInsertWorkflow")
  // Run validation to confirm the project exists in the DB
  const isValid = await validateInsert(userId);
  //logCheckpoint("validateInsert is: ", isValid);
  if (isValid) {
    // If validation passes, show a success toast using Sonner
    //logCheckpoint("Display successful insert toast");
    toast.success("🎉 Project Created", {
      description: `"${title}" was successfully saved.`,
    });

    // Optionally: redirect or open next UI flow
    // router.push("/dashboard");
  } else {
    // If validation fails, show an error toast
    //logCheckpoint("Display record didn't insert toast");
    toast.error("⚠️ Validation Failed", {
      description: `We couldn't confirm that "${title}" was saved. Please check your projects.`,
    }); //postInsertWorkflow
  }
};



/** handleSubmit
 * Handles form submission for the narrative project setup.
 * - Prevents default form behavior.
 * - Inserts the project into Supabase.
 * - Triggers post-insert workflow (validation + toast).
 *
 * @param {React.FormEvent} e - The form submission event.
 */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // Prevent default form behavior
//logCheckpoint("Starting:  handleSubmit")
  try {
    // 🔹 Insert project into Supabase
    const { data, error } = await insertNarrativeProject();

    if (error) {
      console.error("❌ Failed to insert narrative project:", error.message);
      // Optional: You can toast an insert error here if you like
      return;
    }

    if (!data) {
      console.warn("⚠️ No data returned after insert.");
      return;
    }

    const title = data.title;
    const userId = data.user_id; // 🔸 Ensure user_id is returned in .select()

    // 🔹 Post-insert actions (validate + toast)
    await postInsertWorkflow(title, userId);
  } catch (err) {
    console.error("❌ Unhandled submission error:", err);
  }
}; //End of handleSubmit

/**
 * PreventEnterSubmit is a wrapper component that disables form submission 
 * when the user presses the "Enter" key while focused on an <input> element.
 *
 * This is useful to avoid accidental form submissions in forms where pressing
 * Enter inside input fields should not trigger a submit action.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child elements to be wrapped
 * @returns {JSX.Element} A <div> that intercepts Enter key presses on input fields
 *
 * @example
 * <PreventEnterSubmit>
 *   <form>
 *     <input type="text" />
 *     <textarea /> // Enter key still works here
 *     <button type="submit">Submit</button>
 *   </form>
 * </PreventEnterSubmit>
 */
function PreventEnterSubmit({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          e.target instanceof HTMLInputElement
        ) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </div>
  );
}



/********************************
 * Primary Workflow / UI Aspect *
 ********************************/

/** 
 * CreateProjectView
 * ----------------------------------------------------------
 * Main React component that renders the narrative project setup form.
 * - Collects user input for core narrative project fields.
 * - Utilizes Zustand store (`useNarrativeProject`) for form state management.
 * - On submission, triggers insertion into the Supabase `narrative_projects` table.
 * - Provides inline guidance, tooltips, and structure for MVP-level story input.
 *
 * @component
 * @returns {JSX.Element} Rendered narrative project setup form component.
 *
 * @remarks
 * This is the entry point for new story creation and the first step in the user workflow.
 * Future enhancements may include:
 * - Dynamic field validation
 * - Form field grouping
 * - UI routing to dashboard or next assistant phase on successful submit
 */
export default function CreateProjectView() {
  //logCheckpoint("Starting:  NarrativeProjectSetupForm")
  const [titleLocal, setTitleLocal] = useState("");
  const [toneLocal, setToneLocal] = useState("");
  const [coreThemes, setCoreThemes] = useState("");
  const [storySummary, setStorySummary] = useState("");
  const [formatLocal, setFormatLocal] = useState("");
  const [formatIntent, setFormatIntent] = useState("");
  const [intendedAudience, setIntendedAudience] = useState("");
  const [contentRestrictions, setContentRestrictions] = useState("");
  const [genreTags, setGenreTags] = useState("");
  const [worldContext, setWorldContext] = useState("");
  const [centralConflictGoal, setCentralConflictGoal] = useState("");
  const [episodicStructure, setEpisodicStructure] = useState("");
  const [episodeChapterCount, setEpisodeChapterCount] = useState<number | null>(null);
  const [episodeOrChapter, setEpisodeOrChapter] = useState("");
  const [hardChapterLimit, setHardChapterLimit] = useState(false);
  const [structuralNotes, setStructuralNotes] = useState("");
  const [referenceWorks, setReferenceWorks] = useState("");

  //Store references
const title = useNarrativeProject((state) => state.title);
const set_title = useNarrativeProject((state) => state.set_title);

const tone = useNarrativeProject((state) => state.tone);
const set_tone = useNarrativeProject((state) => state.set_tone);

const core_themes = useNarrativeProject((state) => state.core_themes);
const set_core_themes = useNarrativeProject((state) => state.set_core_themes);

const story_summary = useNarrativeProject((state) => state.story_summary);
const set_story_summary = useNarrativeProject((state) => state.set_story_summary);

const format = useNarrativeProject((state) => state.format);
const set_format = useNarrativeProject((state) => state.set_format);

const format_intent = useNarrativeProject((state) => state.format_intent);
const set_format_intent = useNarrativeProject((state) => state.set_format_intent);

const episode_or_chapter = useNarrativeProject((state) => state.episode_or_chapter);
const set_episode_or_chapter = useNarrativeProject((state) => state.set_episode_or_chapter);

const episode_chapter_count = useNarrativeProject((state) => state.episode_chapter_count);
const set_episode_chapter_count = useNarrativeProject((state) => state.set_episode_chapter_count);

const hard_chapter_limit = useNarrativeProject((state) => state.hard_chapter_limit);
const set_hard_chapter_limit = useNarrativeProject((state) => state.set_hard_chapter_limit);

const intended_audience = useNarrativeProject((state) => state.intended_audience);
const set_intended_audience = useNarrativeProject((state) => state.set_intended_audience);

const content_restrictions = useNarrativeProject((state) => state.content_restrictions);
const set_content_restrictions = useNarrativeProject((state) => state.set_content_restrictions);

const genre_tags = useNarrativeProject((state) => state.genre_tags);
const set_genre_tags = useNarrativeProject((state) => state.set_genre_tags);

const world_context = useNarrativeProject((state) => state.world_context);
const set_world_context = useNarrativeProject((state) => state.set_world_context);

const central_conflict_goal = useNarrativeProject((state) => state.central_conflict_goal);
const set_central_conflict_goal = useNarrativeProject((state) => state.set_central_conflict_goal);

const structural_notes = useNarrativeProject((state) => state.structural_notes);
const set_structural_notes = useNarrativeProject((state) => state.set_structural_notes);

const reference_works = useNarrativeProject((state) => state.reference_works);
const set_reference_works = useNarrativeProject((state) => state.set_reference_works);

const episodic_structure = useNarrativeProject((state) => state.episodic_structure);
const set_episodic_structure = useNarrativeProject((state) => state.set_episodic_structure);


  return (
    <PreventEnterSubmit>
    <div className="p-6 space-y-8 bg-slate-100 min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Story Overview */}
        <Card className="p-6">
          <div className="text-lg font-semibold mb-1">Story Overview</div>
          <p className="text-muted-foreground text-sm mb-4">
            Let’s define the project. What are you building? A sweeping fantasy? A gritty noir?
            Set the creative tone and summarize the vision.
          </p>
        <div className="space-y-4">
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="title">Title</Label>
                        <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                      </div>
                      <Input
                        id="titleLocal"
                        value={titleLocal}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setTitleLocal(newValue);
                          set_title(newValue);
                        }}
                        placeholder="Enter story title"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>The name of your book or series.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="tone">Tone</Label>
                        <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                      </div>
                      <Input id="toneLocal" value={toneLocal} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setToneLocal(newValue);
                          set_tone(newValue);
                        }}
                        placeholder="Mood or atmosphere of the story" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>The emotional feel or atmosphere of the story, e.g. dark, hopeful, suspenseful.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="coreThemes">Core Themes</Label>
                        <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                      </div>
                      <Input id="coreThemes" value={coreThemes} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setCoreThemes(newValue);
                          set_core_themes(newValue);
                        }}
                        placeholder="e.g. redemption, betrayal" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>The core concepts or questions explored — e.g. redemption, betrayal, survival.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="summary">Story Summary</Label>
                        <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                      </div>
                      <Textarea id="summary" value={storySummary} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setStorySummary(newValue);
                          set_story_summary(newValue);
                        }}
                        placeholder="Short description of the premise" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Write a short paragraph describing your story’s premise and direction.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>

        {/* Structural Intent */}
        <Card className="p-6">
          <div className="text-lg font-semibold mb-1">Structural Intent</div>
          <p className="text-muted-foreground text-sm mb-4">
            How will the story be delivered and organized? Choose a format, rough length, and how you’ll structure it.
            We’ll help you flex or focus as needed.
          </p>
          <div className="space-y-4">
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="format">Format</Label>
                        <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                      </div>
                      <Input id="formatLocal" value={formatLocal} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setFormatLocal(newValue);
                          set_format(newValue);
                        }}
                        placeholder="e.g. Book, Web Serial" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>The container for your story: Novel, Serial, Script, etc.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="formatIntent">Format Intent</Label>
                        <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                      </div>
                      <Input id="formatIntent" value={formatIntent} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setFormatIntent(newValue);
                          set_format_intent(newValue);
                        }}
                        placeholder="e.g. Standalone novel, Series pilot" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Why this format matters to you or fits your goals — e.g. Serialized for episodic tension.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="episodeOrChapter">Story Units</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                    <Select value={episodeOrChapter} 
                      onValueChange={(value) => {
                        setEpisodeOrChapter(value);
                        set_episode_or_chapter(value);
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select story unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="episode">Episode</SelectItem>
                        <SelectItem value="chapter">Chapter</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>How you break up your story: by Episodes or by Chapters.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="episodeOrChapterCount">Episode or Chapter Count</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                    <Input id="episodeOrChapterCount" value={episodeChapterCount ?? ''}
                      onChange={(e) => {
                        const newValue = e.target.value === '' ? null : parseInt(e.target.value, 10);
                        setEpisodeChapterCount(newValue);
                        set_episode_chapter_count(newValue);
                      }}
                      placeholder="Number of installments" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>The expected or target number of installments.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                    <Label htmlFor="hardChapterLimit">Hard Chapter Limit?</Label>
                    <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    <Switch
                      id="hard_chapter_limit"
                      checked={hardChapterLimit}
                      onCheckedChange={(checked: boolean) => {
                        setHardChapterLimit(checked);           // Update local state
                        set_hard_chapter_limit(checked);        // Sync to ZeusState
                      }}
                    />
                </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>If checked, the story will not exceed this count during automation or structuring.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>

        {/* Audience & Boundaries */}
        <Card className="p-6">
          <div className="text-lg font-semibold mb-1">Audience & Boundaries</div>
          <p className="text-muted-foreground text-sm mb-4">
            Who is this for, and what should we know? Zoom out to consider the social and thematic space this book inhabits.
          </p>
          <div className="space-y-4">
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="audience">Intended Audience</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                      <Input id="intendedAudience" value={intendedAudience} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setIntendedAudience(newValue);
                          set_intended_audience(newValue);
                        }}
                        placeholder="e.g. Adult, Young Adult" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Who the story is aimed at — e.g. children, YA, adults.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="contentRestrictions">Content Restrictions</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                        <Input id="contentRestrictions" value={contentRestrictions} 
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setContentRestrictions(newValue);
                            set_content_restrictions(newValue);
                          }}
                          placeholder="Violence, language, etc." />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>List any boundaries to observe: no gore, PG-13 language, etc.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="genreTags">Genre Tags</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                      <Input id="genreTags" value={genreTags} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setGenreTags(newValue);
                          set_genre_tags(newValue);
                        }}
                        placeholder="e.g. Fantasy, Thriller" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Comma-separated genres or subgenres (e.g. fantasy, horror, romance).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>

        {/* Design Notes */}
        <Card className="p-6">
          <div className="text-lg font-semibold mb-1">Design Notes</div>
          <p className="text-muted-foreground text-sm mb-4">
            Extra notes for your future self — or your AI story design partner. What should we remember as we build this?
          </p>
          <div className="space-y-4">
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="worldContext">World Context</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                      <Textarea id="worldContext" value={worldContext} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setWorldContext(newValue);
                          set_world_context(newValue);
                        }}
                        placeholder="Notes on setting or world logic" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Brief notes on your setting or the world’s logic. E.g. magic rules, tech level, historical backdrop.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="conflictGoal">Central Conflict or Goal</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                      <Textarea id="centralConflictGoal" value={centralConflictGoal} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setCentralConflictGoal(newValue);
                          set_central_conflict_goal(newValue);
                        }} placeholder="e.g. Escape the regime, find the relic" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>What drives the story? Is there a clear goal or central conflict?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="structuralNotes">Structural Notes</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                      <Textarea id="structuralNotes" value={structuralNotes} 
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setStructuralNotes(newValue);
                          set_structural_notes(newValue);
                        }}
                        placeholder="Beat design, pacing ideas, special structure" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Any thoughts about beat structure, pacing, or unique POV plans.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="referenceWorks">Reference Works</Label>
                      <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                      <Textarea id="referenceWorks" value={referenceWorks} 
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setReferenceWorks(newValue);
                        set_reference_works(newValue);
                      }}
                      placeholder="List key references or comps" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Books, shows, or other works to draw inspiration from or emulate in tone.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
            </div>
          
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="episodicStructure">Episodic Structure</Label>
                    <Info className="w-3 h-4 text-muted-foreground cursor-pointer" />
                  </div>
                    <Textarea
                      id="episodicStructure"
                      value={episodicStructure}
                      onChange={(e) => {
                          const newValue = e.target.value;
                          setEpisodicStructure(newValue);
                          set_episodic_structure(newValue);
                        }}
                      placeholder="e.g., Rotating POV, nested timelines"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Optional: Describe any unique structural patterns like alternating POVs, flashback framing, etc.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
		              
          </div>  

      </Card>

        <Button type="submit" className="bg-blue-600 hover:bg-blue-800 text-white">
          Save Project
        </Button>
      </form>
    </div>
    </PreventEnterSubmit>
  )
}

