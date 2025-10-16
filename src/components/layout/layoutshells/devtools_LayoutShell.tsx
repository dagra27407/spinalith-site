/**
 * devToolsLayout (theme-aligned shell)
 *
 * Plain-English (2am-you): Layout wrapper for the DevTools area. This is a
 * classes-only update to align with our tokenized theme and spacing model.
 * No routing or logic changes.
 *
 * Changes:
 *  - Root: `min-h-screen bg-background text-foreground flex flex-col`
 *  - Remove extra p-* from the scroll container; views own spacing via .app-page
 *  - Keep split-pane scroll: sidebar fixed; right pane scrolls
 */

import { Outlet } from "react-router-dom";
import NavBar from "@/components/layout/navbars/devtools_NavBar";
import SidebarTree from "@/components/layout/sidebars/devtools_SidebarTree";
import { Toaster } from "@/components/ui/sonner";

export default function devToolsLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top devtools nav */}
      <NavBar />

      {/* Main split: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarTree />
        <div id="app-main" role="main" className="flex-1 overflow-auto">
          {/* NOTE: Dev views provide their own spacing via .app-page */}
          <Outlet />
        </div>
      </div>

      {/* Global toasts */}
      <Toaster />
    </div>
  );
}
