import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import AuthScreen from "@/components/auth/Auth";
import AppRouter from "@/router/Router";

// ✅ NEW: design tokens runtime init (loads saved palette and sets CSS vars)
import { initThemeFromLocalStorage } from "@/lib/ui/designTokens";

/**
 * App
 *
 * Plain-English:
 * - Initializes our design tokens once on boot (colors/vars for shadcn + Tailwind).
 * - Listens for Supabase auth session changes and renders either:
 *     - <AppRouter /> when authenticated
 *     - <AuthScreen /> when not
 */
export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  // 1) Theme bootstrapping (safe, runs once). If no saved theme, uses "slate".
  /*useEffect(() => {
    initThemeFromLocalStorage("indigo");
  }, []);*/
    // 1) Theme bootstrapping + console helper (dev only)
  useEffect(() => {
    initThemeFromLocalStorage("slate");

    // expose a quick tester in the console: setTheme('indigo') / setTheme('slate')
    (window as any).setTheme = (k: ThemeKey) => setTheme(k);

    // tidy up on hot reload/unmount
    return () => {
      delete (window as any).setTheme;
    };
  }, []);

  // 2) Supabase session wiring (your existing logic)
  useEffect(() => {
    // Get current session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup on unmount
    return () => subscription.unsubscribe();
  }, []);

  // App entry point: route to app or auth screen
  return session ? <AppRouter /> : <AuthScreen />;
}
