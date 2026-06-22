export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/email/reminders";

/**
 * POST /api/debug/test-reminder-email
 * 
 * Test endpoint to diagnose Resend email issues.
 * Sends a test email to see detailed error messages.
 * 
 * Body: { 
 *   toEmail: string (required)
 * }
 * 
 * This endpoint is PUBLIC for testing only — remove after debugging!
 */
export async function POST(req: NextRequest) {
  try {
    const { toEmail } = await req.json();

    if (!toEmail) {
      return NextResponse.json(
        { error: "toEmail is required in body" },
        { status: 400 }
      );
    }

    console.log(`[TEST] Sending test reminder email to: ${toEmail}`);

    const sent = await sendReminderEmail({
      userEmail: toEmail,
      userName: "Test User",
      jobTitle: "Senior Software Engineer",
      companyName: "Tech Corp",
      reminderMessage: "Follow up on your application",
      reminderType: "followup",
      dueAt: new Date().toISOString(),
    });

    if (sent) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${toEmail}`,
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to send test email — check server logs for details",
          message:
            "If using onboarding@resend.dev, verify the recipient email in your Resend dashboard. If using a custom domain, make sure it's verified in Resend.",
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
