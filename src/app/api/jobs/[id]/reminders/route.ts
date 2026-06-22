export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch all reminders for a specific job application
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the job
    const { data: job, error: jobErr } = await supabase
      .from("job_applications")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job application not found or access denied" }, { status: 404 });
    }

    const { data: reminders, error: reminderErr } = await supabase
      .from("job_reminders")
      .select("*")
      .eq("job_id", id)
      .order("due_at", { ascending: true });

    if (reminderErr) {
      return NextResponse.json({ error: reminderErr.message }, { status: 500 });
    }

    return NextResponse.json(reminders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// POST: Add a new reminder to a specific job application
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the job
    const { data: job, error: jobErr } = await supabase
      .from("job_applications")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job application not found or access denied" }, { status: 404 });
    }

    const body = await req.json();
    const { due_at, type, message, notification_email } = body;

    if (!due_at || !message) {
      return NextResponse.json({ error: "Due date and message are required" }, { status: 400 });
    }

    const { data: reminder, error: insertErr } = await supabase
      .from("job_reminders")
      .insert({
        job_id: id,
        due_at,
        type: type || "followup",
        message,
        status: "pending",
        notification_email: notification_email?.trim() || null,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(reminder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// DELETE: Delete a reminder
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const reminderId = searchParams.get("reminderId");

    if (!reminderId) {
      return NextResponse.json({ error: "reminderId query parameter is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error: deleteErr } = await supabase
      .from("job_reminders")
      .delete()
      .eq("id", reminderId)
      .eq("job_id", id); // double validation

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// PATCH: Toggle reminder completion status (status: pending/done)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const reminderId = searchParams.get("reminderId");

    if (!reminderId) {
      return NextResponse.json({ error: "reminderId query parameter is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    const { data: reminder, error: updateErr } = await supabase
      .from("job_reminders")
      .update({ status: status || "done" })
      .eq("id", reminderId)
      .eq("job_id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json(reminder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
