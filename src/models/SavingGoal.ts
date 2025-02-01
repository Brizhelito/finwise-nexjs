import prisma from "@/lib/prisma";
import Decimal from "decimal.js";
export interface CreateSavingGoalData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  due_date: Date;
}
export interface SavingGoalFilter {
  userId: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  sortDirection?: "asc" | "desc";
  sortBy?: "name" | "targetAmount" | "dueDate" | "currentAmount";
  isCompleted?: boolean;
}
export class SavingGoal {
  static async create(data: {
    name: string;
    targetAmount: number;
    user_id: number;
    due_date: Date;
    currentAmount?: Decimal;
  }) {
    const savingGoalData = { ...data, currentAmount: new Decimal(0) };
    return prisma.savingGoal.create({ data: savingGoalData });
  }

  static async getFilteredSavingGoals(data: SavingGoalFilter) {
    const where: {
      user_id: number;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      name?: { contains: string; mode: "insensitive" };
      due_date?: { gte?: Date; lte?: Date };
      isCompleted?: boolean;
    } = { user_id: data.userId };
    const sortBy = data.sortBy ? { [data.sortBy]: data.sortDirection } : {};
    try {
      if (data.startDate || data.endDate) {
        where.createdAt = {};
        if (data.startDate) {
          where.createdAt.gte = data.startDate;
        }
        if (data.endDate) {
          where.createdAt.lte = data.endDate;
        }
      }
      if (data.name) {
        where.name = { contains: data.name, mode: "insensitive" };
      }
      if (data.dueDate) {
        where.due_date = { gte: data.dueDate };
      }
      if (data.isCompleted !== undefined) {
        where.isCompleted = data.isCompleted;
      }
      const response = await prisma.savingGoal.findMany({
        where,
        orderBy: sortBy,
      });
      return response;
    } catch (error) {
      console.error((error as Error).message);
    }
  }
  static async update(id: number, data: Partial<Omit<SavingGoal, "id">>) {
    return prisma.savingGoal.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.savingGoal.delete({ where: { id } });
  }
  static async getAllByUserId(userId: number) {
    return prisma.savingGoal.findMany({ where: { user_id: userId } });
  }
}
