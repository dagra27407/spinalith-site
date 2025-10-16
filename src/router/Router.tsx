/**
 * AppRouter (cleaned v2)
 *
 * Plain-English: Central place that wires up every page/route in the app.
 * This version:
 *  - Keeps your existing homepage (AllProjectsView) as the index route
 *  - Adds a nested /projects group that mirrors the Arcs routing style
 *  - Nests Arcs under /projects/:projectId/story-arcs (list/new/detail/edit)
 *  - Removes a duplicate home route and unused legacy routes
 *
 * If you later want the Projects list to be the homepage, swap the index element
 * from <AllProjectsView /> to <ProjectsListView /> (see comment below).
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Top-level layout shells
import SpinalithCoreLayout from "@/components/layout/layoutshells/default_LayoutShell";
import DevtoolsLayoutShell from "@/components/layout/layoutshells/devtools_LayoutShell";

// Core views
import AllProjectsView from "@/views/AllProjectsView"; // currently the homepage
import MainProjectView from "@/views/MainProjectView"; // project dashboard
import StoryArcBeatsView from "@/views/StoryArcBeatsView";
import CharactersView from "@/views/CharactersView";
import CharacterDesignView from "@/views/CharacterDesignView";

// Narrative Projects views (new, Arcs-style flow)
import ProjectsListView from "@/views/projects/ProjectsListView";
import ProjectEditView from "@/views/projects/ProjectEditView";
import ProjectDetailView from "@/views/projects/ProjectDetailView";

// Arc views (new, Arcs-style flow)
import ArcsListView from "@/views/arcs/ArcsListView";
import ArcEditView from "@/views/arcs/ArcEditView";
import ArcDetailView from "@/views/arcs/ArcDetailView";

// Beats views
import BeatsListView from "@/views/beats/BeatsListView";
import BeatEditView from "@/views/beats/BeatEditView";
import BeatDetailView from "@/views/beats/BeatDetailView";
import BeatsHubView from "@/views/beats/BeatsHubView";

// Devtools views
import TestEdgeFunctionView from "@/views/devtools/TestEdgeFunctionView";
import DuplicateRecordView from "@/views/devtools/DuplicateRecordView";
import PayloadMapBuilderView from "@/views/devtools/PayloadMapBuilderView";
import TestThemeView from "@/views/devtools/TestThemeView";

// Fallback view
import NotFound from "@/views/NotFound";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default app layout */}
        <Route path="/" element={<SpinalithCoreLayout />}>
          {/*
            Homepage: keep AllProjectsView for now. To make Projects the homepage later,
            change to: <Route index element={<ProjectsListView />} />
          */}
          <Route index element={<AllProjectsView />} />

          {/* Narrative Projects (CRUD + dashboard) */}
          <Route path="projects">
            {/* List all projects */}
            <Route index element={<ProjectsListView />} />
            {/* Create new project */}
            <Route path="new" element={<ProjectEditView />} />
            {/* Project dashboard (existing view) */}
            <Route path=":projectId" element={<MainProjectView />} />
            {/* Edit existing project */}
            <Route path=":projectId/edit" element={<ProjectEditView />} />
            {/* Details View */}
            <Route path=":projectId/details" element={<ProjectDetailView />} />
            {/* Beats Hub View */ }
            <Route path=":projectId/beats" element={<BeatsHubView />} />

            {/* Story Arcs under a project */}
            <Route path=":projectId/story-arcs">
              <Route index element={<ArcsListView />} />
              <Route path="new" element={<ArcEditView />} />
              <Route path=":arcId" element={<ArcDetailView />} />
              <Route path=":arcId/edit" element={<ArcEditView />} />
              <Route path=":arcId/beats">
                <Route index element={<BeatsListView />} />
                <Route path="new" element={<BeatEditView />} />
                <Route path=":beatId" element={<BeatDetailView />} />
                <Route path=":beatId/edit" element={<BeatEditView />} />
              </Route>
            </Route>

            {/* Other project-scoped views */}
            <Route path=":projectId/character-design" element={<CharacterDesignView />} />
            <Route path=":projectId/characters" element={<CharactersView />} />
            {/* If Beats becomes nested under arcs in the future, you can move it accordingly. */}
            <Route path=":projectId/story-arc-beats" element={<StoryArcBeatsView />} />
          </Route>
        </Route>

        {/* Devtools layout */}
        <Route path="/devtools" element={<DevtoolsLayoutShell />}>
          <Route index element={<TestEdgeFunctionView />} />
          <Route path="TestEdgeFunctionView" element={<TestEdgeFunctionView />} />
          <Route path="DuplicateRecordView" element={<DuplicateRecordView />} />
          <Route path="PayloadMapBuilderView" element={<PayloadMapBuilderView />} />
          <Route path="TestThemeView" element={<TestThemeView />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
