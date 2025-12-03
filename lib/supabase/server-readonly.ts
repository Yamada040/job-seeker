import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../database.types";

// Read-only client for Server Components (no cookie mutations)
export const createSupabaseReadonlyClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // set/remove intentionally omitted to avoid Next.js cookie write restrictions in Server Components
    },
  });
};
