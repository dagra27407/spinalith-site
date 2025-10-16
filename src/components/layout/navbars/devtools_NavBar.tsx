/**
 * Devtools NavBar (theme-aligned)
 *
 * Plain-English (2am-you): Top bar for the Dev Tools area. This is a
 * classes-only pass to align with our tokenized theme + spacing utilities.
 * No logic/routing changes.
 *
 * Changes:
 *  - Wrapper → sticky top bar with token surfaces: bg-card / text / border
 *  - Spacing → compact, consistent gap (container w/ max width)
 *  - Kept shadcn Tabs + Buttons; removed hard-coded bg/shadow
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Navigation bar for the Dev Tools section.
 */
export default function NavBar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dev Tools"); // default to Dev Tools
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") setActiveTab("Default");
    else if (location.pathname.includes("/devtools")) setActiveTab("Dev Tools");
  }, [location.pathname]);

  /** Home (All Projects) */
  const handleGoHome = () => navigate("/");

  /** Tab change */
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "Default":
        navigate("/");
        break;
      case "Dev Tools":
        navigate("/devtools");
        break;
      default:
        break;
    }
  };

  /** Sign out */
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="app-navbar app-navbar--tint">
      <div className="mx-auto max-w-screen-2xl px-4 py-2 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="text-lg font-semibold tracking-tight select-none">Spinalith — Dev Tools</div>

        {/* Primary navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="gap-2">
            <TabsTrigger value="Default">Default</TabsTrigger>
            <TabsTrigger value="Dev Tools">Dev Tools</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoHome}
            aria-label="Go to All Projects"
            title="Go to All Projects"
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    </div>
  );
}
