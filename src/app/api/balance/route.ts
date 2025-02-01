// app/api/budgets/route.ts
import { NextResponse } from "next/server";
import { Budget } from "@/models/Budget";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("x-user-id")?.value;
  try {
    const balance = await Budget.getBalanceByUserId(Number(userId));
    return NextResponse.json({ balance });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
