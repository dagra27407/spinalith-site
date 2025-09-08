/**
 * SpinalithCoreLayout
 *
 * Main authenticated application layout for Spinalith.
 * Includes:
 * - <NavBar />: Top nav
 * - <SidebarTree />: Left-hand project/module tree
 * - <Outlet />: Workspace for nested route views
 * - <Toaster />: Global toast notifications (via Sonner)
 *
 * This layout wraps all authenticated routes inside AppRouter.
 *
 * @returns {JSX.Element} Full-page layout structure for the main app
 */

import { Outlet } from "react-router-dom";
import NavBar from "@/components/layout/navbars/devtools_NavBar";
import SidebarTree from "@/components/layout/sidebars/devtools_SidebarTree";
import { Toaster } from "@/components/ui/sonner";


export default function devToolsLayout() {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarTree />
        <div className="flex-1 overflow-auto p-0">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

