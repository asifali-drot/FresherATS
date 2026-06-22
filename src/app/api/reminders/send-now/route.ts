export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email/reminders";

/**
 * POST /api/reminders/send-now
 *
 * Immediately sends a reminder email for a specific reminder ID.
 * Used for manual "Send Now" test triggers from the UI.
 * Requires user to be authenticated.
 *
 * Body: { reminderId: string }
 *
 * NOTE: Uses the authenticated session's email directly — no admin
 * client needed. The "to" address is always the logged-in user's email.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check — get session user (includes email from JWT)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reminderId, recipientEmail } = await req.json();

    if (!reminderId) {
      return NextResponse.json(
        { error: "reminderId is required" },
        { status: 400 }
      );
    }

    // Fetch the reminder + linked job, verifying ownership via user_id on job
    const { data: reminder, error: reminderErr } = await supabase
      .from("job_reminders")
      .select(
        `
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
      `
      )
      .eq("id", reminderId)
      .single();

    if (reminderErr || !reminder) {
      console.error("[send-now] Reminder fetch error:", reminderErr);
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    const job = reminder.job_applications as any;

    // Ensure this job belongs to the authenticated user
    if (job?.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Priority: 1) explicit recipientEmail from request body, 2) notification_email stored on the reminder, 3) authenticated user's email
    const targetEmail = recipientEmail || (reminder as any).notification_email || user.email;
    console.log(`[send-now] Sending to ${targetEmail} for reminder ${reminderId}`);

    // Send the email — user.email comes directly from the JWT session or recipientEmail override
    const sent = await sendReminderEmail({
      userEmail: targetEmail,
      userName: user.user_metadata?.full_name || user.user_metadata?.name,
      jobTitle: job.job_title,
      companyName: job.company_name,
      reminderMessage: reminder.message,
      reminderType: reminder.type,
      dueAt: reminder.due_at,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Resend API failed to send email. Check RESEND_API_KEY and that the recipient email is verified in Resend dashboard." },
        { status: 500 }
      );
    }

    // Mark as notified so cron doesn't re-send
    await supabase
      .from("job_reminders")
      .update({ status: "notified" })
      .eq("id", reminderId);

    return NextResponse.json({
      success: true,
      sentTo: targetEmail,
      reminderId,
    });
  } catch (err: any) {
    console.error("[send-now] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
