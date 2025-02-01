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
}
