// /app/api/user/recover-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/UserService";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  try {
    const response = await UserService.sendPasswordRecoveryEmail(email);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
