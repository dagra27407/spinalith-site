import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import AuthScreen from "@/components/auth/Auth";
import AppRouter from "@/router/Router";

/**
 * App
 *
 * Root component of the Spinalith app. Handles Supabase auth session state.
 * If a session exists, routes to the main application via <AppRouter />.
 * Otherwise, renders the <AuthScreen /> for login/registration.
 *
 * @returns {JSX.Element} Authenticated or unauthenticated app entry point.
 */
export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return session ? <AppRouter /> : <AuthScreen />;
}
