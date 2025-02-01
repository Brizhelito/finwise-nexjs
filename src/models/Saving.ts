import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class Saving {
  static async create(data: { total_saved: number; user_id: number }) {
    return prisma.saving.create({ data });
  }

  static async findByUserId(userId: number) {
    return prisma.saving.findUnique({ where: { user_id: userId } });
  }

  static async update(id: number, data: { total_saved: number }) {
    return prisma.saving.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.saving.delete({ where: { id } });
  }
}
