import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export class User {
  static async create(data: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
  }) {
    return prisma.user.create({ data });
  }

  static async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async update(id: number, data: Partial<Omit<User, "id">>) {
    return prisma.user.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
  static async findByUsernameOrEmail(emailOrUsername: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
  }
  /**
   * Verifica que la contraseña en texto plano coincida con el hash almacenado.
   *
   * @param candidatePassword Contraseña ingresada por el usuario.
   * @param hashedPassword Contraseña almacenada en la base de datos (hasheada).
   * @returns {Promise<boolean>} True si las contraseñas coinciden, false de lo contrario.
   */
  static async verifyPassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  /**
   * Hashea una contraseña en texto plano.
   *
   * @param password Contraseña en texto plano a hashear.
   * @returns {Promise<string>} La contraseña hasheada.
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Número de rondas de salt (ajusta según tus necesidades)
    return bcrypt.hash(password, saltRounds);
  }
}
