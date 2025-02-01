// src/repositories/savingRepository.ts
import { Prisma, Saving } from "@prisma/client";
import prisma from "@/lib/prisma";

export const createSaving = async (
  data: Prisma.SavingCreateInput
): Promise<Saving> => {
  return prisma.saving.create({
    data,
  });
};

export const getSavingByUserId = async (
  userId: number
): Promise<Saving | null> => {
  return prisma.saving.findUnique({
    where: {
      user_id: userId,
    },
  });
};

export const updateSaving = async (
  id: number,
  data: Prisma.SavingUpdateInput
): Promise<Saving> => {
  return prisma.saving.update({
    where: { id },
    data,
  });
};

export const deleteSaving = async (id: number): Promise<Saving> => {
  return prisma.saving.delete({
    where: { id },
  });
};
