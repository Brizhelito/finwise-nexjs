import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import { UserService } from "@/services/UserService"; // Importamos la clase UserService
import { User } from "@/models/User"; // Importamos el modelo User
import {
  emailValidator,
  passwordValidator,
  usernameValidator,
} from "../utils/validators";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

// Login
 const loginUser = async ({
  emailOrUsername,
  password,
}: {
  emailOrUsername: string;
  password: string;
}) => {
  // Buscar el usuario por correo o nombre de usuario (ya convertido a minúsculas en el modelo)
  const user = await User.findByUsernameOrEmail(emailOrUsername);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Verificar si la cuenta está activada
  if (!user.activated) {
    throw new Error(
      "Cuenta no activada. Por favor, activa tu cuenta antes de iniciar sesión."
    );
  }

  // Comparar la contraseña ingresada con el hash almacenado
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Contraseña incorrecta");
  }

  // Crear la sesión del usuario
  await createSession(user.id);

  // Devolver la respuesta, removiendo el campo de la contraseña
  return NextResponse.json(
    {
      message: "Inicio de sesión exitoso",
      user: { ...user, password: undefined },
    },
    { status: 200 }
  );
};

// Registro
const registerUser = async ({
  email,
  username,
  password,
  first_name,
  last_name,
}: {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<NextResponse> => {
  try {
    emailValidator.parse(email);
    usernameValidator.parse(username);
    passwordValidator.parse(password);
    const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de "salt rounds" para bcrypt

    const { user, budget, saving } = await UserService.createUser({
      email,
      username,
      password: hashedPassword,
      first_name,
      last_name,
    });

    return NextResponse.json(
      { message: "Usuario registrado exitosamente", user, budget, saving },
      { status: 201 }
    );
  } catch (error) {
    let errorMessage = "Un error desconocido ocurrió";
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
};

// Refrescar el accessToken usando el refreshToken
const refreshToken = async (refreshToken: string): Promise<string> => {
  if (!refreshToken) throw new Error("Token de actualización requerido");

  try {
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    const newAccessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);
    return newAccessToken;
  } catch (error) {
    throw new Error("Token de actualización inválido o expirado" + error);
  }
};

// Verificar un token
const verifyToken = async (token: string, secret: Uint8Array) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error("Token inválido o expirado" + error);
  }
};

export { loginUser, registerUser, refreshToken, verifyToken };
