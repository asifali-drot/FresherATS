export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch all contacts for a specific job application
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

    // Verify user owns the job first
    const { data: job, error: jobErr } = await supabase
      .from("job_applications")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job application not found or access denied" }, { status: 404 });
    }

    const { data: contacts, error: contactErr } = await supabase
      .from("job_contacts")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false });

    if (contactErr) {
      return NextResponse.json({ error: contactErr.message }, { status: 505 });
    }

    return NextResponse.json(contacts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// POST: Add a new contact to a specific job application
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
    const { name, role, email, linkedin_url, notes } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data: contact, error: insertErr } = await supabase
      .from("job_contacts")
      .insert({
        job_id: id,
        name,
        role,
        email,
        linkedin_url,
        notes
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// DELETE or PUT/PATCH can be supported. To make it extremely simple, let's allow DELETE on job_contacts through query params, or support it in another file. Let's add delete in this route if action is DELETE by reading query param or checking method. Let's support DELETE method with a query param contactId.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json({ error: "contactId query parameter is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete contact
    const { error: deleteErr } = await supabase
      .from("job_contacts")
      .delete()
      .eq("id", contactId)
      .eq("job_id", id); // double validation

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
