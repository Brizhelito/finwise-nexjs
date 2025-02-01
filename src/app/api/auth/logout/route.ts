import { NextResponse } from "next/server";

// Manejo del método POST para cerrar sesión
export async function POST() {
  try {
    const res = NextResponse.json({ message: "Sesión cerrada" });
    // Limpiamos las cookies de autenticación
    res.cookies.set("accessToken", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });
    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });
    res.cookies.set("authVerified", "", {
      httpOnly: true,
      maxAge: 0,
    });
    return res;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { message: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}

// Manejo del método GET si es necesario
export async function GET() {
  return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
}
