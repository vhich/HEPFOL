import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseAnonKey || !supabaseUrl) {
    throw new Error("Missing supabase environment keys.");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
