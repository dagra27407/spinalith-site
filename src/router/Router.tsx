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
import SpinalithCoreLayout from "@/components/layout/Core_Layout_Modular";
import AllProjectsView from "@/views/AllProjectsView";
import MainProjectView from "@/views/MainProjectVIew";
import CreateProjectView from "@/views/CreateProjectView";
import StoryArcsView from "@/views/StoryArcsView";
import StoryArcBeatsView from "@/views/StoryArcBeatsView";
import CharactersView from "@/views/CharactersView";
import TestEdgeFunctionView from "@/views/TestEdgeFunctionView";
import NotFound from "@/views/NotFound";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpinalithCoreLayout />}>
          <Route index element={<AllProjectsView />} />
          <Route path="/" element={<AllProjectsView />} />
          <Route path="/new-project" element={<CreateProjectView />} />
          <Route path="/projects/:projectId" element={<MainProjectView />} />
          <Route path="/projects/:projectId/story-arcs" element={<StoryArcsView />} />
          <Route path="/projects/:projectId/story-arc-beats" element={<StoryArcBeatsView />} />
          <Route path="/projects/:projectId/characters" element={<CharactersView />} />
          <Route path="/TestEdgeFunctionView" element={<TestEdgeFunctionView />} />


          


        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

