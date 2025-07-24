/**
 * useNarrativeProject.ts
 * Zustand store for managing the state of a narrative project across the application.
 * This allows components to access, update, and synchronize narrative project data with Supabase.
 */

import { create } from 'zustand';

// 🔹 Define the structure of the narrative project store
interface NarrativeProject {
    id?: string; // Supabase-generated ID
    status?: string //used as a project state indicator
    narrative_status?: string //used as a project workflow state indicator
    title: string;
    tone: string;
    core_themes: string;
    story_summary: string;
    format: string;
    format_intent: string;
    episode_or_chapter: string;
    episode_chapter_count: number | null;
    hard_chapter_limit: boolean;
    intended_audience: string;
    content_restrictions: string;
    genre_tags: string;
    world_context: string;
    central_conflict_goal: string;
    structural_notes: string;
    reference_works: string;
    episodic_structure: string;
    set_title: (value: string) => void;
    set_tone: (value: string) => void;
    set_core_themes: (value: string) => void;
    set_story_summary: (value: string) => void;
    set_format: (value: string) => void;
    set_format_intent: (value: string) => void;
    set_episode_or_chapter: (value: string) => void;
    set_episode_chapter_count: (value: number | null) => void;
    set_hard_chapter_limit: (value: boolean) => void;
    set_intended_audience: (value: string) => void;
    set_content_restrictions: (value: string) => void;
    set_genre_tags: (value: string) => void;
    set_world_context: (value: string) => void;
    set_central_conflict_goal: (value: string) => void;
    set_structural_notes: (value: string) => void;
    set_reference_works: (value: string) => void;
    set_episodic_structure: (value: string) => void;

}

// 🔹 Define the store shape, including state and updater actions
interface NarrativeProjectStore {
  narrativeProject: NarrativeProject;
  setNarrativeProject: (project: Partial<NarrativeProject>) => void;
  resetNarrativeProject: () => void;
}



/**
 * Zustand store: useNarrativeProject
 * Provides global access and updates to narrative project data.
 */
export const useNarrativeProject = create<NarrativeProject>((set) => ({
    // ✅ Supabase metadata and workflow state
    id: undefined,
    status: undefined,
    narrative_status: undefined,

    // ✅ Form fields and setters
    title: '',
    set_title: (value: string) => set({ title: value }),

    tone: '',
    set_tone: (value: string) => set({ tone: value }),

    core_themes: '',
    set_core_themes: (value: string) => set({ core_themes: value }),

    story_summary: '',
    set_story_summary: (value: string) => set({ story_summary: value }),

    format: '',
    set_format: (value: string) => set({ format: value }),

    format_intent: '',
    set_format_intent: (value: string) => set({ format_intent: value }),

    episode_or_chapter: '',
    set_episode_or_chapter: (value: string) => set({ episode_or_chapter: value }),

    episode_chapter_count: null,
    set_episode_chapter_count: (value: number | null) => set({ episode_chapter_count: value }),

    hard_chapter_limit: false,
    set_hard_chapter_limit: (value: boolean) => set({ hard_chapter_limit: value }),

    intended_audience: '',
    set_intended_audience: (value: string) => set({ intended_audience: value }),

    content_restrictions: '',
    set_content_restrictions: (value: string) => set({ content_restrictions: value }),

    genre_tags: '',
    set_genre_tags: (value: string) => set({ genre_tags: value }),

    world_context: '',
    set_world_context: (value: string) => set({ world_context: value }),

    central_conflict_goal: '',
    set_central_conflict_goal: (value: string) => set({ central_conflict_goal: value }),

    structural_notes: '',
    set_structural_notes: (value: string) => set({ structural_notes: value }),

    reference_works: '',
    set_reference_works: (value: string) => set({ reference_works: value }),

    episodic_structure: '',
    set_episodic_structure: (value: string) => set({ episodic_structure: value }),
}));


