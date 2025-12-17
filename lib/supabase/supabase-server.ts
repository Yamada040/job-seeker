/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const getEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL/Anon Key is missing. Check env.");
  }
  return { supabaseUrl, supabaseAnonKey };
};

export const createSupabaseServerReadonlyClient = async (): Promise<SupabaseClient<any>> => {
  const { supabaseUrl, supabaseAnonKey } = getEnv();
  const cookieStore = await cookies();
  return createServerClient<any>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
};

export const createSupabaseServerActionClient = async (): Promise<SupabaseClient<any>> => {
  const { supabaseUrl, supabaseAnonKey } = getEnv();
  const cookieStore = await cookies();
  return createServerClient<any>(supabaseUrl, supabaseAnonKey, {
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

// Backward-compatible aliases
export const createSupabaseServerClient = createSupabaseServerReadonlyClient;
export const createSupabaseReadonlyClient = createSupabaseServerReadonlyClient;
export const createSupabaseActionClient = createSupabaseServerActionClient;
