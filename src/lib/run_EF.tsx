// utils/run_EF.ts
import { supabase } from "@/lib/supabaseClient";

export async function run_EF(endpoint: string,body_Payload: any) {
  //Get fresh user auth token
  await supabase.auth.refreshSession();      // guarantees a fresh 1-hour token
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;       // guaranteed fresh

  //Ensure provided body is clean json
  let serializedBody: string;
  try {
    serializedBody = JSON.stringify(body_Payload);
  } catch (err) {
    throw new Error(`Invalid JSON provided run_EF(${endpoint}): ` + err.message);
  }

  //Make HTTP Call
  const FUNCTION_BASE_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
  console.log(`${FUNCTION_BASE_URL}${endpoint}`);
  const res = await fetch(`${FUNCTION_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: serializedBody
  });

  if (!res.ok) {
    let errorDetails;
    try {
      errorDetails = await res.json();
    } catch {
      errorDetails = await res.text();
    }
    throw new Error(`EF ${endpoint} failed - ${res.status}: ${JSON.stringify(errorDetails)}`);
  }


  //Return the data portion of the HTTP response
  const data = await res.json();
  return {
    data
  };
}