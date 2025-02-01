// app/api/savings/route.ts
import { Saving } from "@/models/Saving";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get("x-user-id")?.value);
  const savings = await Saving.findByUserId(userId);
  const total_saved = savings?.total_saved || 0;
  return NextResponse.json({ total_saved });
}
