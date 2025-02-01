// src/repositories/userRepository.ts

import { Prisma, User } from "@prisma/client"; // Importar Prisma y sus tipos
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10; // Número de rondas de sal
  return bcrypt.hash(password, saltRounds);
};

// Definir un tipo de error específico para los errores de creación de usuario
export class UserCreationError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "UserCreationError"; // Asegura que sea un tipo específico de error
  }
}

export const createUser = async (
  data: Prisma.UserCreateInput
): Promise<User> => {
  try {
    // Verificar si ya existe un usuario con el mismo correo electrónico
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUserByEmail) {
      throw new UserCreationError(
        "El correo electrónico ya está registrado.",
        "EMAIL_IN_USE"
      );
    }

    // Verificar si ya existe un usuario con el mismo nombre de usuario
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUserByUsername) {
      throw new UserCreationError(
        "El nombre de usuario ya está registrado.",
        "USERNAME_IN_USE"
      );
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await hashPassword(data.password);

    // Crear el usuario con la contraseña encriptada
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword, // Reemplazar la contraseña original por la encriptada
      },
    });
  } catch (error) {
    if (error instanceof UserCreationError) {
      throw error; // Lanzamos el error personalizado
    }

    console.error("Error al crear usuario:", error);
    throw new Error("Error al crear el usuario en la base de datos.");
  }
};

export const getUserByEmailOrUsername = async (
  emailOrUsername: string
): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });
};

export const getUserById = async (id: number): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const updateUser = async (
  id: number,
  data: Prisma.UserUpdateInput
): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: number): Promise<User> => {
  return prisma.user.delete({
    where: { id },
  });
};
