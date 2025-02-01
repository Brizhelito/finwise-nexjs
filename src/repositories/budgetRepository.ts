// src/repositories/budgetRepository.ts
import { Prisma, Budget } from "@prisma/client";
import prisma from "@/lib/prisma";

export const createBudget = async (
  data: Prisma.BudgetCreateInput
): Promise<Budget> => {
  return prisma.budget.create({
    data,
  });
};

export const getBudgetByUserId = async (
  userId: number
): Promise<Budget | null> => {
  return prisma.budget.findUnique({
    where: {
      user_id: userId,
    },
  });
};

export const updateBudget = async (
  id: number,
  data: Prisma.BudgetUpdateInput
): Promise<Budget> => {
  return prisma.budget.update({
    where: { id },
    data,
  });
};

export const deleteBudget = async (id: number): Promise<Budget> => {
  return prisma.budget.delete({
    where: { id },
  });
};
