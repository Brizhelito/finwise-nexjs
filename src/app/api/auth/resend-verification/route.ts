import { UserService } from "@/services/UserService";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
    const body = await request.json();
    const { email } = body;
    try {
      const response = await UserService.sendAccountActivationEmail(email);
      return NextResponse.json(response);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
}