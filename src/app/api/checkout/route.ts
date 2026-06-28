import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentProvider } from "@/lib/payments/lemonsqueezy";
import { PlanId } from "@/lib/pricing/plans";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, student } = body as { planId: PlanId; student?: boolean };

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // Upsert customer if needed
    const customerId = await paymentProvider.ensureCustomer({
      userId: user.id,
      email: user.email || "",
    });

    const host = req.headers.get("host") || "fresherats.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const { url } = await paymentProvider.createCheckout({
      userId: user.id,
      planId,
      student,
      customerId,
      email: user.email,
      successUrl: `${baseUrl}/pricing/success`,
      cancelUrl: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
