/**
 * AppRouter
 *
 * Defines the main application routing structure using React Router DOM.
 * Wraps the authenticated application views inside <SpinalithCoreLayout />.
 * 
 * Routes:
 * - "/" → Main Project Dashboard (Project List / Create)
 * - "/project/:projectId" → Project-specific dashboard
 * - "*" → 404 fallback
 *
 * @returns {JSX.Element} BrowserRouter-wrapped application routes.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
//import top level layout shells
import SpinalithCoreLayout from "@/components/layout/layoutshells/default_LayoutShell";
import DevtoolsLayoutShell from "@/components/layout/layoutshells/devtools_LayoutShell";

//import outlet views, these are the views swaped as the primary window
//Core Views
import AllProjectsView from "@/views/AllProjectsView";
import MainProjectView from "@/views/MainProjectVIew";
import CreateProjectView from "@/views/CreateProjectView";
import StoryArcsView from "@/views/StoryArcsView";
import StoryArcBeatsView from "@/views/StoryArcBeatsView";
import CharactersView from "@/views/CharactersView";
import CharacterDesignView from "@/views/CharacterDesignView"

//devtool views
import TestEdgeFunctionView from "@/views/devtools/TestEdgeFunctionView";
import DuplicateRecordView from "@/views/devtools/DuplicateRecordView";
import PayloadMapBuilderView from "@/views/devtools/PayloadMapBuilderView";

//fall back view
import NotFound from "@/views/NotFound";

//Router logic when called
export default function AppRouter() {
  return (
    <BrowserRouter>
    {/* Default app layout */}
      <Routes>
        <Route path="/" element={<SpinalithCoreLayout />}>
          <Route index element={<AllProjectsView />} />
          <Route path="/" element={<AllProjectsView />} />
          <Route path="new-project" element={<CreateProjectView />} />
          <Route path="projects/:projectId" element={<MainProjectView />} />
          <Route path="projects/:projectId/story-arcs" element={<StoryArcsView />} />
          <Route path="projects/:projectId/story-arc-beats" element={<StoryArcBeatsView />} />
          <Route path="projects/:projectId/character-design" element={<CharacterDesignView />} />
          <Route path="projects/:projectId/characters" element={<CharactersView />} />
        </Route>
      {/* Devtools layout */}
        <Route path="/devtools" element={<DevtoolsLayoutShell />}>
          <Route index element={<TestEdgeFunctionView />} />
          <Route path="TestEdgeFunctionView" element={<TestEdgeFunctionView />} />
          <Route path="DuplicateRecordView" element={<DuplicateRecordView />} />
          <Route path="PayloadMapBuilderView" element={<PayloadMapBuilderView />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

