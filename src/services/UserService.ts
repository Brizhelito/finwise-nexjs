import { Budget } from "@/models/Budget";
import { Saving } from "@/models/Saving";
import { User } from "@/models/User";
import prisma from "@/lib/prisma";

export class UserService {
  static async createUser(data: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
  }) {
    const { username, password, email, first_name, last_name } = data;

    try {
      return await prisma.$transaction(async () => {
        // Usar métodos de las clases
        const user = await User.create({
          username,
          password,
          email,
          first_name,
          last_name,
        });
        const budget = await Budget.create({ user_id: user.id, balance: 0 });
        const saving = await Saving.create({
          user_id: user.id,
          total_saved: 0,
        });
        return { user, budget, saving };
      });
    } catch (error) {
      console.error("Error creating user, budget, and saving:", error);
      throw new Error("Unable to create user with budget and saving");
    }
  }
  /**
   * Actualiza los datos del usuario y/o su contraseña.
   *
   * @param data Objeto con los datos necesarios para actualizar:
   *  - userId: ID del usuario (obtenido desde la cookie).
   *  - currentPassword: contraseña actual para validar la autenticidad.
   *  - newPassword (opcional): nueva contraseña (si se desea cambiar).
   *  - first_name (opcional): nuevo nombre.
   *  - last_name (opcional): nuevo apellido.
   *
   * @throws Error si el usuario no existe o la contraseña actual es incorrecta.
   */
  static async updateUser(data: {
    userId: number;
    currentPassword: string;
    newPassword?: string;
    first_name?: string;
    last_name?: string;
  }) {
    const { userId, currentPassword, newPassword, first_name, last_name } =
      data;

    try {
      // Buscar el usuario en la base de datos
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Validar que la contraseña actual proporcionada coincida
      // Se asume que User.verifyPassword utiliza, por ejemplo, bcrypt.compare
      const isValid = await User.verifyPassword(currentPassword, user.password);
      if (!isValid) {
        throw new Error("La contraseña actual es incorrecta");
      }

      // Preparar los datos a actualizar
      const updateData: {
        first_name?: string;
        last_name?: string;
        password?: string;
      } = {};

      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;

      if (newPassword) {
        // Se asume que User.hashPassword se encarga de hashear la nueva contraseña
        const hashedPassword = await User.hashPassword(newPassword);
        updateData.password = hashedPassword;
      }

      // Actualizar el usuario en la base de datos
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("No se pudo actualizar el usuario");
    }
  }
}
