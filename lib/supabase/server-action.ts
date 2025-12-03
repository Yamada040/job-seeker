import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../database.types";

export const createSupabaseActionClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: { path?: string }) {
        cookieStore.set(name, value, { path: options?.path ?? "/" });
      },
      remove(name: string, options?: { path?: string }) {
        cookieStore.set(name, "", { path: options?.path ?? "/", expires: new Date(0) });
      },
    },
  });
};
