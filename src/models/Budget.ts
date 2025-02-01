import prisma from "@/lib/prisma";

export class Budget {
  static async create(data: { balance: number; user_id: number }) {
    return prisma.budget.create({ data });
  }

  static async findByUserId(userId: number) {
    return prisma.budget.findUnique({ where: { user_id: userId } });
  }

  static async update(id: number, data: { balance: number }) {
    return prisma.budget.update({ where: { id }, data });
  }
  static async updateBalance(id: number, balance: number) {
    return prisma.budget.update({ where: { id }, data: { balance } });
  }
  static async getBalanceByUserId(userId: number) {
    const budget = await prisma.budget.findFirst({
      where: { user_id: userId },
    });
    return budget?.balance;
  }
}
