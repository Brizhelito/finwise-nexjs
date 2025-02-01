import { NextRequest, NextResponse } from "next/server";
import {
  loginUser,
  registerUser,
  refreshToken,
  verifyToken,
} from "../services/authService"; // Importamos los servicios
export const login = async (req: NextRequest) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const response = await loginUser({ emailOrUsername: email, password });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 400 }
    );
  }
};

export const register = async (req: NextRequest) => {
  try {
    const { email, username, password, first_name, last_name } =
      await req.json();

    if (!email || !username || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const response = await registerUser({
      email,
      username,
      password,
      first_name,
      last_name,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 400 }
    );
  }
};

export const refresh = async (req: NextRequest) => {
  try {
    const cookies = req.cookies;
    const refreshTokenValue = cookies.get("refreshToken")?.value;

    if (!refreshTokenValue) {
      return NextResponse.json(
        { error: "Token de actualización requerido" },
        { status: 400 }
      );
    }

    const newAccessToken = await refreshToken(refreshTokenValue);
    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 400 }
    );
  }
};
export const status = async (req: NextRequest) => {
  try {
    // Intentamos obtener el accessToken y refreshToken desde las cookies
    const cookies = req.cookies;
    const accessTokenValue = cookies.get("accessToken")?.value;
    const refreshTokenValue = cookies.get("refreshToken")?.value;

    // Primero, intentamos validar el accessToken
    if (accessTokenValue) {
      try {
        const payload = await verifyToken(
          accessTokenValue,
          new TextEncoder().encode(process.env.JWT_SECRET)
        );
        // Si el accessToken es válido, devolvemos el estado del usuario
        return NextResponse.json(
          { message: "Usuario autenticado", user: payload },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error al verificar el accessToken:", error);
      }
    }

    // Si el accessToken es inválido o no está presente, verificamos el refreshToken
    if (refreshTokenValue) {
      try {
        await verifyToken(
          refreshTokenValue,
          new TextEncoder().encode(process.env.JWT_REFRESH_SECRET)
        );

        // Si el refreshToken es válido, generamos un nuevo accessToken
        const newAccessToken = await refreshToken(refreshTokenValue);

        // Establecemos el nuevo accessToken como una cookie
        const response = NextResponse.json(
          { IsAuthenticated: true },
          { status: 200 }
        );

        response.cookies.set("accessToken", newAccessToken, {
          ...cookies.get("accessToken"),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        return response;
      } catch {
        // Si el refreshToken es inválido o ha expirado, eliminamos las cookies
        const response = NextResponse.json(
          { isAuthenticated: false },
          { status: 401 }
        );

        // Borrar las cookies
        response.cookies.set("accessToken", "", {
          ...cookies.get("accessToken"),
          maxAge: 0,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        response.cookies.set("refreshToken", "", {
          ...cookies.get("refreshToken"),
          maxAge: 0,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        return response;
      }
    }

    // Si no hay tokens (ni accessToken ni refreshToken), se requiere autenticación
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  } catch (error) {
    // En caso de errores inesperados, devolvemos un error genérico
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 400 }
    );
  }
};
