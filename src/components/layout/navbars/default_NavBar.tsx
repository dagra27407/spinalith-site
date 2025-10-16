/**
 * NavBar (theme-aligned)
 *
 * Plain-English (2am-you): Top navigation for the main app shell. This is a
 * classes-only pass to align with our tokenized theme + spacing utilities.
 * No logic/routing changes.
 *
 * Changes:
 *  - Wrapper → sticky top bar with token surfaces: bg-card / text / border
 *  - Spacing → compact, consistent gap
 *  - Kept shadcn Tabs + Buttons; no hard-coded colors
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Home, Activity } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

/**
 * Navigation bar component for the main Spinalith interface.
 * Displays the application name, primary navigation tabs,
 * a devtools quick button, a home button, and sign-out.
 */
export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Home");

  // Keep the tab UI in sync with the current location
  useEffect(() => {
    if (location.pathname === "/") setActiveTab("Home");
    else if (location.pathname.startsWith("/devtools")) setActiveTab("Dev Tools");
  }, [location.pathname]);

  /** Home (All Projects) */
  const handleGoHome = () => navigate("/");
  /** Devtools root */
  const handleTestView = () => navigate("/devtools");

  /** Sign out */
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      window.location.reload();
    }
  };

  /** Tab switching */
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "Home":
        navigate("/");
        break;
      case "Dev Tools":
        navigate("/devtools");
        break;
      default:
        break;
    }
  };

  return (
    <div className="app-navbar app-navbar--tint">
      <div className="mx-auto max-w-screen-2xl px-4 py-2 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="text-lg font-semibold tracking-tight select-none">Spinalith</div>

        {/* Primary navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="gap-2">
            <TabsTrigger value="Home">Home</TabsTrigger>
            <TabsTrigger value="Dev Tools">Dev Tools</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTestView}
            aria-label="Go to Dev Tools"
            title="Go to Dev Tools"
          >
            <Activity className="h-5 w-5" />
          </Button>
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


