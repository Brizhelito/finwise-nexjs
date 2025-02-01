// src/utils/validators.ts

import { z } from "zod";

// Validación para el correo electrónico
export const emailValidator = z
  .string()
  .email("El correo electrónico no es válido")
  .min(5, "El correo electrónico debe tener al menos 5 caracteres")
  .max(100, "El correo electrónico no puede superar los 100 caracteres");

// Validación para la contraseña (mínimo 8 caracteres, al menos una letra y un número)
export const passwordValidator = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[a-zA-Z]/, "La contraseña debe contener al menos una letra")
  .regex(/\d/, "La contraseña debe contener al menos un número");

// Validación para el nombre de usuario (mínimo 3 caracteres)
export const usernameValidator = z
  .string()
  .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
  .max(30, "El nombre de usuario no puede superar los 30 caracteres");

// Puedes agregar más validaciones si es necesario.
