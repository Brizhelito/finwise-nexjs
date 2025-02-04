import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/UserService";
import {cookies } from "next/headers";
export async function PUT(req: NextRequest) {
    try {
      const cookieStore = await cookies();
      const userId = Number(cookieStore.get("x-user-id")?.value);
      // Obtener el userId desde la cookie
      if (!userId) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }

      // Parsear el body del request
      const { currentPassword, newPassword, first_name, last_name } =
        await req.json();

      if (!currentPassword) {
        return NextResponse.json(
          { error: "La contraseña actual es obligatoria" },
          { status: 400 }
        );
      }

      // Llamar al servicio para actualizar el usuario
      const updatedUser = await UserService.updateUser({
        userId,
        currentPassword,
        newPassword,
        first_name,
        last_name,
      });

      return NextResponse.json({
        message: "Usuario actualizado con éxito",
        user: updatedUser,
      });
    } catch (error: unknown) {
      console.error("Error en la actualización del usuario:", error);

      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

}
