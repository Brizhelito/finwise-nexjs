// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/UserService";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    // Se llama al método para resetear la contraseña
    const result = await UserService.resetPassword(token, newPassword);

    return NextResponse.json(result);
  } catch (error: unknown) {
    let errorMessage = "Error al restablecer la contraseña";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
