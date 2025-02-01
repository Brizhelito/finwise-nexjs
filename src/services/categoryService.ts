// src/services/categoryService.ts
import { Prisma, Category } from "@prisma/client"; // Importar los tipos de Prisma
import * as categoryRepository from "@/repositories/categoryRepository";

export const createCategory = async (
  data: Prisma.CategoryCreateInput
): Promise<Category> => {
  return categoryRepository.createCategory(data);
};

export const getCategoryByName = async (
  name: string
): Promise<Category | null> => {
  return categoryRepository.getCategoryByName(name);
};

export const updateCategory = async (
  id: number,
  data: Prisma.CategoryUpdateInput
): Promise<Category> => {
  return categoryRepository.updateCategory(id, data);
};

export const deleteCategory = async (id: number): Promise<Category> => {
  return categoryRepository.deleteCategory(id);
};
export const getAllCategories = async (): Promise<Category[]> => {
  return categoryRepository.getAllCategories(); // Agregar este método
};
