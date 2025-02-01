// src/services/budgetService.ts
import { Prisma, Budget } from "@prisma/client"; // Importar los tipos de Prisma
import * as budgetRepository from "@/repositories/budgetRepository";

export const createBudget = async (
  data: Prisma.BudgetCreateInput
): Promise<Budget> => {
  return budgetRepository.createBudget(data);
};

export const getBudgetByUserId = async (
  userId: number
): Promise<Budget | null> => {
  return budgetRepository.getBudgetByUserId(userId);
};

export const updateBudget = async (
  id: number,
  data: Prisma.BudgetUpdateInput
): Promise<Budget> => {
  return budgetRepository.updateBudget(id, data);
};

export const deleteBudget = async (id: number): Promise<Budget> => {
  return budgetRepository.deleteBudget(id);
};
