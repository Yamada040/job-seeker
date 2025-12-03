// Default to readonly client to avoid cookie writes in Server Components.
export { createSupabaseReadonlyClient as createSupabaseServerClient } from "./server-readonly";
