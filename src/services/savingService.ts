// src/services/savingService.ts
import { Prisma, Saving } from "@prisma/client"; // Importar los tipos de Prisma
import * as savingRepository from "@/repositories/savingRepository";

export const createSaving = async (
  data: Prisma.SavingCreateInput
): Promise<Saving> => {
  return savingRepository.createSaving(data);
};

export const getSavingByUserId = async (
  userId: number
): Promise<Saving | null> => {
  return savingRepository.getSavingByUserId(userId);
};

export const updateSaving = async (
  id: number,
  data: Prisma.SavingUpdateInput
): Promise<Saving> => {
  return savingRepository.updateSaving(id, data);
};

export const deleteSaving = async (id: number): Promise<Saving> => {
  return savingRepository.deleteSaving(id);
};
