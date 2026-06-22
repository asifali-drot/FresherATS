export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReminderEmail } from "@/lib/email/reminders";

/**
 * GET /api/reminders/send
 *
 * Called hourly by Vercel Cron Job (vercel.json).
 * Finds all pending reminders that are past their due_at,
 * sends email notifications via Resend, then marks them "notified".
 *
 * Protected by CRON_SECRET header or query param.
 *
 * IMPORTANT: Uses adminSupabase for ALL DB queries to bypass RLS.
 * The cron runs without a user session cookie, so the anon-key client
 * with RLS would return 0 rows silently.
 */
export async function GET(req: NextRequest) {
  // ── Auth guard ──
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const querySecret = new URL(req.url).searchParams.get("secret");

  const providedSecret = authHeader?.replace("Bearer ", "") || querySecret;

  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client for ALL operations — cron has no session, RLS would block
  let adminSupabase: ReturnType<typeof createAdminClient>;
  try {
    adminSupabase = createAdminClient();
  } catch (e: any) {
    console.error("[Cron] Admin client init failed:", e.message);
    return NextResponse.json(
      { error: "Server misconfiguration: " + e.message },
      { status: 500 }
    );
  }

  try {
    // ── Fetch overdue pending reminders (bypasses RLS via service role) ──
    const now = new Date().toISOString();
    console.log(`[Cron] Scanning for overdue reminders at ${now}`);

    const { data: reminders, error: fetchErr } = await adminSupabase
      .from("job_reminders")
      .select(`
        id,
        message,
        type,
        due_at,
        status,
        notification_email,
        job_id,
        job_applications (
          job_title,
          company_name,
          user_id
        )
      `)
      .eq("status", "pending")
      .lte("due_at", now)
      .limit(50); // safety cap per cron run

    if (fetchErr) {
      console.error("[Cron] Failed to fetch reminders:", fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    console.log(`[Cron] Found ${reminders?.length ?? 0} overdue pending reminders`);

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ processed: 0, message: "No overdue reminders found." });
    }

    // ── Process each reminder ──
    const results: { id: string; email: string; sent: boolean }[] = [];

    for (const reminder of reminders) {
      const job = reminder.job_applications as any;
      if (!job?.user_id) {
        console.warn(`[Cron] Reminder ${reminder.id} has no user_id, skipping`);
        continue;
      }

      // Get user email via admin API (bypasses RLS)
      const { data: userData, error: userErr } =
        await adminSupabase.auth.admin.getUserById(job.user_id);

      if (userErr || (!userData?.user?.email && !reminder.notification_email)) {
        console.warn(`[Cron] Could not fetch email for user ${job.user_id}:`, userErr?.message);
        continue;
      }

      const targetEmail = reminder.notification_email || userData?.user?.email;

      const sent = await sendReminderEmail({
        userEmail: targetEmail,
        userName: userData.user.user_metadata?.full_name,
        jobTitle: job.job_title,
        companyName: job.company_name,
        reminderMessage: reminder.message,
        reminderType: reminder.type,
        dueAt: reminder.due_at,
      });

      if (sent) {
        // Mark as notified so we don't re-send (use admin to bypass RLS)
        await adminSupabase
          .from("job_reminders")
          .update({ status: "notified" })
          .eq("id", reminder.id);
      }

      results.push({ id: reminder.id, email: targetEmail, sent });
    }

    const sentCount = results.filter((r) => r.sent).length;
    console.log(`[Cron] Done — processed ${reminders.length}, sent ${sentCount} emails.`);

    return NextResponse.json({
      processed: reminders.length,
      sent: sentCount,
      results,
    });
  } catch (err: any) {
    console.error("[Cron] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
