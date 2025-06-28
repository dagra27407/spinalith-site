import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nasiludjkymotbqwolix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hc2lsdWRqa3ltb3RicXdvbGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MDc3NDQsImV4cCI6MjA2NDk4Mzc0NH0.UK17Vc5JA22gGC0bDwmmchqw-5RXHGG9Gn-3hD7jMME';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
