// src/repositories/savingTransactionRepository.ts
import { Prisma, SavingTransaction } from "@prisma/client";
import prisma from "@/lib/prisma";

export const createSavingTransaction = async (
  data: Prisma.SavingTransactionCreateInput
): Promise<SavingTransaction> => {
  return prisma.savingTransaction.create({
    data,
  });
};

export const getSavingTransactionsByUserId = async (
  userId: number
): Promise<SavingTransaction[]> => {
  return prisma.savingTransaction.findMany({
    where: {
      user_id: userId,
    },
  });
};

export const updateSavingTransaction = async (
  id: number,
  data: Prisma.SavingTransactionUpdateInput
): Promise<SavingTransaction> => {
  return prisma.savingTransaction.update({
    where: { id },
    data,
  });
};

export const deleteSavingTransaction = async (
  id: number
): Promise<SavingTransaction> => {
  return prisma.savingTransaction.delete({
    where: { id },
  });
};
