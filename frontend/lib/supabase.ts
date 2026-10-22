import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseSchema = Record<string, never>;

let client: SupabaseClient<SupabaseSchema> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<SupabaseSchema> {
  if (client) {
    return client;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseAnonKey || !supabaseUrl) {
    throw new Error("Missing supabase environment keys");
  }
  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
