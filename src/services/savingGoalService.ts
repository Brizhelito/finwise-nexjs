// src/services/savingGoalService.ts
import { Prisma, SavingGoal } from "@prisma/client"; // Importar los tipos de Prisma
import * as savingGoalRepository from "@/repositories/savingGoalRepository";

export const createSavingGoal = async (
  data: Prisma.SavingGoalCreateInput
): Promise<SavingGoal> => {
  return savingGoalRepository.createSavingGoal(data);
};

export const getSavingGoalsByUserId = async (
  userId: number
): Promise<SavingGoal[]> => {
  return savingGoalRepository.getSavingGoalsByUserId(userId);
};

export const updateSavingGoal = async (
  id: number,
  data: Prisma.SavingGoalUpdateInput
): Promise<SavingGoal> => {
  return savingGoalRepository.updateSavingGoal(id, data);
};

export const deleteSavingGoal = async (id: number): Promise<SavingGoal> => {
  return savingGoalRepository.deleteSavingGoal(id);
};
