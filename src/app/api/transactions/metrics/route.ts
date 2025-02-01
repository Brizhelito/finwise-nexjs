import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get("x-user-id")?.value);
  const metrics = await Transaction.getMontlyTransactionsMetrics(userId);
  return NextResponse.json(metrics);
}
