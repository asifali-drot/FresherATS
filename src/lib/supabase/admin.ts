import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses SERVICE_ROLE key.
 * Only use server-side (API routes / cron jobs). Never expose to the client.
 * Required for auth.admin.* methods such as getUserById().
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "[Admin Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
