// src/services/savingTransactionService.ts
import { Prisma, SavingTransaction } from "@prisma/client"; // Importar los tipos de Prisma
import * as savingTransactionRepository from "@/repositories/savingTransactionRepository";

export const createSavingTransaction = async (
  data: Prisma.SavingTransactionCreateInput
): Promise<SavingTransaction> => {
  return savingTransactionRepository.createSavingTransaction(data);
};

export const getSavingTransactionsByUserId = async (
  userId: number
): Promise<SavingTransaction[]> => {
  return savingTransactionRepository.getSavingTransactionsByUserId(userId);
};

export const updateSavingTransaction = async (
  id: number,
  data: Prisma.SavingTransactionUpdateInput
): Promise<SavingTransaction> => {
  return savingTransactionRepository.updateSavingTransaction(id, data);
};

export const deleteSavingTransaction = async (
  id: number
): Promise<SavingTransaction> => {
  return savingTransactionRepository.deleteSavingTransaction(id);
};
