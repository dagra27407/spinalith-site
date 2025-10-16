/**
 * SpinalithCoreLayout (theme-aligned shell)
 *
 * Plain-English (2am-you): Main authenticated layout wrapper. This pass is
 * classes-only to align with our tokenized theme. No routing or logic changes.
 *
 * Changes:
 *  - Root: `min-h-screen bg-background text-foreground` (theme surfaces)
 *  - Let views own padding (`app-page`), so content wrapper has no extra p-*
 *  - Preserve scroll behavior: sidebar fixed, content scrolls
 */

import { Outlet } from "react-router-dom";
import NavBar from "@/components/layout/navbars/default_NavBar";
import SidebarTree from "@/components/layout/sidebars/default_SidebarTree";
import { Toaster } from "@/components/ui/sonner";

export default function SpinalithCoreLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top navigation (keeps its own styling) */}
      <NavBar />

      {/* Main area: sidebar + scrollable content */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarTree />
        <div id="app-main" role="main" className="flex-1 overflow-auto">
          {/* NOTE: Views provide their own spacing via .app-page */}
          <Outlet />
        </div>
      </div>

      {/* Global toasts (Sonner) */}
      <Toaster />
    </div>
  );
}
