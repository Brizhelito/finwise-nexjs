// app/api/auth/verify-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/UserService";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    // Se verifica que el token sea válido. El método arroja error si no lo es.
    await UserService.verifyPasswordRecoveryToken(token);

    return NextResponse.json({ message: "Token válido" });
  } catch (error: unknown) {
    let errorMessage = "Error al verificar el token";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
