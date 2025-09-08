// src/components/layout/NavBar.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { Home } from "lucide-react";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // if not already imported
import { useLocation } from "react-router-dom";




/**
 * Navigation bar component for the main Spinalith interface.
 * 
 * Displays the application name, primary navigation tabs, 
 * a home button (navigates to All Projects view), and sign-out functionality.
 */
export default function NavBar() {
const navigate = useNavigate();
const [activeTab, setActiveTab] = useState("Home");

const location = useLocation();

useEffect(() => {
  if (location.pathname === "/")  setActiveTab("Home");
  else if (location.pathname.includes("/devtools")) setActiveTab("Dev Tools");
}, [location.pathname]);

/**
 * Navigates the user to the All Projects view.
 * Triggered by clicking the home icon button in the nav bar.
 */
const handleGoHome = () => {
  navigate("/");
};

/**
 * Used in testing to navigate us to our TestView page
 */
const handleTestView = () => {
  navigate("/devtools");
};


/**
 * Sign user out and navigate to login screen
 */
const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error signing out:", error.message)
  } else {
    // Optional: redirect to login or reload the page
    window.location.reload()
  }
}



const handleTabChange = (tab: string) => {
  setActiveTab(tab); // update state for UI
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
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
      <div className="text-xl font-semibold">Spinalith</div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="gap-2">
          <TabsTrigger value="Home">Home</TabsTrigger>
          <TabsTrigger value="Dev Tools">Dev Tools</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleTestView}
          aria-label="Go to TestView"
        >
          <Activity className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoHome}
          aria-label="Go to All Projects"
        >
          <Home className="h-5 w-5" />
        </Button>
        <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
      </div>




      
    </div>
  )
}


