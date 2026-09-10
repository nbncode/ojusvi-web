import { createMiddleware } from "@tanstack/react-start";

/**
 * Same behaviour as the generated `attachSupabaseAuth`, but the Supabase client
 * (~110 KiB) is imported lazily inside the handler instead of at module scope.
 * `src/start.ts` is part of the client entry, so a static import would ship
 * supabase-js to every visitor — including the marketing pages that never call
 * a server function.
 */
export const attachSupabaseAuthLazy = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { supabase } = await import("./client");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
