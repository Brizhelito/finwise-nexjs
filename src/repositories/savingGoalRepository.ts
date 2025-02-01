// src/repositories/savingGoalRepository.ts
import { Prisma, SavingGoal } from "@prisma/client";
import prisma from "@/lib/prisma";

export const createSavingGoal = async (
  data: Prisma.SavingGoalCreateInput
): Promise<SavingGoal> => {
  return prisma.savingGoal.create({
    data,
  });
};

export const getSavingGoalsByUserId = async (
  userId: number
): Promise<SavingGoal[]> => {
  return prisma.savingGoal.findMany({
    where: {
      user_id: userId,
    },
  });
};

export const updateSavingGoal = async (
  id: number,
  data: Prisma.SavingGoalUpdateInput
): Promise<SavingGoal> => {
  return prisma.savingGoal.update({
    where: { id },
    data,
  });
};

export const deleteSavingGoal = async (id: number): Promise<SavingGoal> => {
  return prisma.savingGoal.delete({
    where: { id },
  });
};
