import { PrismaClient } from "@prisma/client";

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
}
