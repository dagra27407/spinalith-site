// utils/callEdge.ts
import { supabase } from "./supabaseClient";

export async function callHelloWorld() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch('https://nasiludjkymotbqwolix.functions.supabase.co/TestInsert', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  };

  const data = await res.json();
  return {
    data
  };
}
