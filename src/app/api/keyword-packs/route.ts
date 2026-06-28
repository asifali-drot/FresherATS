import { NextResponse } from "next/server";
import { PACK_INDEX } from "@/lib/keyword-packs/data";

export async function GET() {
  return NextResponse.json(PACK_INDEX);
}
